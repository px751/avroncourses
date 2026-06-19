import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore, collection, collectionData, query, orderBy,
  doc, addDoc, deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ArchivedList, ListItem, Rayon } from '../models';
import { RAYON_META } from '../utils/rayon';
import { normalize } from '../utils/normalize';

export interface MonthlyPurchase { month: string; count: number; }

export interface ProductStat {
  id: string;
  name: string;
  rayon: string;
  rayonDot: string;
  rayonLabel: string;
  purchaseCount: number;
  estimatedDays: number;
  avgDays: number;
  monthlyPurchases: MonthlyPurchase[];
  lastAddedAt: number;
  lastAddedBy: string;
  lastCheckedAt?: number;
  lastCheckedBy?: string;
  prevPurchaseAt?: number;
  prevPurchaseBy?: string;
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private fs = inject(Firestore);
  private archivesRef = collection(this.fs, 'archives');

  readonly lists: Signal<ArchivedList[]>;
  readonly productSearch = signal('');
  readonly activeTab = signal<'lists' | 'products'>('lists');
  private rayonOverrides = signal<Record<string, Rayon>>(this.loadRayonOverrides());

  readonly products: Signal<ProductStat[]>;
  readonly filteredProducts: Signal<ProductStat[]>;

  constructor() {
    const lists$ = collectionData(
      query(this.archivesRef, orderBy('date', 'desc')),
      { idField: 'id' },
    ) as Observable<ArchivedList[]>;

    this.lists = toSignal(lists$, { initialValue: [] });

    this.products = computed(() => this.computeProducts(this.lists()));

    this.filteredProducts = computed(() => {
      const q = normalize(this.productSearch());
      if (!q) return this.products();
      return this.products().filter(p => normalize(p.name).includes(q));
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────

  getProductById(id: string): ProductStat | undefined {
    return this.products().find(p => p.id === id);
  }

  getProductByName(name: string): ProductStat | undefined {
    const n = normalize(name);
    return this.products().find(p => normalize(p.name) === n);
  }

  setProductRayon(id: string, rayon: Rayon) {
    this.rayonOverrides.update(o => ({ ...o, [id]: rayon }));
    localStorage.setItem('ac_rayon_overrides', JSON.stringify(this.rayonOverrides()));
  }

  archiveList(items: ListItem[], participants: string[]) {
    addDoc(this.archivesRef, { date: Date.now(), items, participants });
  }

  deleteList(id: string) {
    deleteDoc(doc(this.fs, 'archives', id));
  }

  // ── Product computation ───────────────────────────────────────────────────

  private computeProducts(lists: ArchivedList[]): ProductStat[] {
    // Collect purchases per product (oldest first so latest wins for name/rayon)
    const map = new Map<string, {
      name: string;
      rayon: Rayon;
      purchases: { date: number; addedBy: string }[];
    }>();

    for (const list of [...lists].sort((a, b) => a.date - b.date)) {
      for (const item of list.items) {
        if (!item.name?.trim()) continue;
        const key = normalize(item.name);
        if (!map.has(key)) map.set(key, { name: item.name, rayon: item.rayon as Rayon, purchases: [] });
        const p = map.get(key)!;
        p.name  = item.name;        // keep latest casing
        p.rayon = item.rayon as Rayon;
        p.purchases.push({ date: list.date, addedBy: item.addedBy });
      }
    }

    const now = Date.now();
    const results: ProductStat[] = [];

    for (const [key, p] of map) {
      const sorted = [...p.purchases].sort((a, b) => b.date - a.date);
      const last   = sorted[0];
      const prev   = sorted[1];

      let avgDays = 0;
      let estimatedDays = 0;

      if (sorted.length >= 2) {
        const intervals: number[] = [];
        for (let i = 0; i < sorted.length - 1; i++) {
          const days = (sorted[i].date - sorted[i + 1].date) / 86_400_000;
          if (days <= 365) intervals.push(days); // ignore irregular > 1 year
        }
        if (intervals.length > 0) {
          avgDays = Math.round(intervals.reduce((a, b) => a + b) / intervals.length);
          const daysSinceLast = (now - last.date) / 86_400_000;
          estimatedDays = Math.max(0, Math.round(avgDays - daysSinceLast));
        }
      }

      const rayon = this.rayonOverrides()[key] ?? p.rayon;
      const meta  = RAYON_META[rayon] ?? RAYON_META['inconnue'];

      results.push({
        id: key,
        name: p.name,
        rayon,
        rayonDot:   meta.dot,
        rayonLabel: meta.label,
        purchaseCount:  sorted.length,
        estimatedDays,
        avgDays,
        monthlyPurchases: this.computeMonthlyPurchases(sorted.map(s => s.date)),
        lastAddedAt:   last.date,
        lastAddedBy:   last.addedBy,
        lastCheckedAt: last.date,
        lastCheckedBy: last.addedBy,
        prevPurchaseAt: prev?.date,
        prevPurchaseBy: prev?.addedBy,
      });
    }

    // Sort: soonest estimate first, then by purchase count
    return results.sort((a, b) => {
      if (a.estimatedDays > 0 && b.estimatedDays > 0) return a.estimatedDays - b.estimatedDays;
      if (a.estimatedDays > 0) return -1;
      if (b.estimatedDays > 0) return 1;
      return b.purchaseCount - a.purchaseCount;
    });
  }

  private computeMonthlyPurchases(dates: number[]): MonthlyPurchase[] {
    const MONTHS = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];
    const now    = new Date();
    const result: MonthlyPurchase[] = [];

    for (let i = 6; i >= 0; i--) {
      const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = dates.filter(ts => {
        const d = new Date(ts);
        return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
      }).length;
      result.push({ month: MONTHS[ref.getMonth()], count });
    }

    // Trim leading zero-months (keep min 2)
    let start = 0;
    while (start < result.length - 2 && result[start].count === 0) start++;
    return result.slice(start);
  }

  private loadRayonOverrides(): Record<string, Rayon> {
    try {
      return JSON.parse(localStorage.getItem('ac_rayon_overrides') ?? '{}');
    } catch { return {}; }
  }
}
