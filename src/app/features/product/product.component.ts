import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { HistoryService, MonthlyPurchase } from '../../core/services/history.service';
import { MembersService } from '../../core/services/members.service';
import { ListService } from '../../core/services/list.service';
import { SessionService } from '../../core/services/session.service';
import { MemberColorPipe } from '../../shared/pipes/member-color.pipe';
import { FrenchDatePipe } from '../../shared/pipes/french-date.pipe';
import { RAYON_META } from '../../core/utils/rayon';
import { normalize } from '../../core/utils/normalize';
import { Rayon } from '../../core/models';

const RAYON_ORDER: Rayon[] = ['fruits', 'frais', 'epicerie', 'inconnue'];

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [DecimalPipe, MemberColorPipe, FrenchDatePipe],
  templateUrl: './product.component.html',
})
export class ProductComponent {
  private route    = inject(ActivatedRoute);
  private router   = inject(Router);
  private location = inject(Location);
  private session  = inject(SessionService);
  readonly history = inject(HistoryService);
  readonly members = inject(MembersService);
  readonly list    = inject(ListService);

  private productId = toSignal(this.route.paramMap.pipe(map(p => p.get('id') ?? '')));

  readonly product = computed(() => {
    const id = this.productId() ?? '';
    // Prioritise archived history; fall back to current list item (not yet archived)
    return this.history.getProductById(id) ?? this.buildFromListItem(id);
  });

  private buildFromListItem(id: string) {
    const item = this.list.items().find(i => normalize(i.name) === id);
    if (!item) return null;
    const meta = RAYON_META[item.rayon] ?? RAYON_META['inconnue'];
    return {
      id,
      name:          item.name,
      rayon:         item.rayon as string,
      rayonDot:      meta.dot,
      rayonLabel:    meta.label,
      purchaseCount: 0,
      estimatedDays: 0,
      avgDays:       0,
      monthlyPurchases: [] as import('../../core/services/history.service').MonthlyPurchase[],
      lastAddedAt:    item.addedAt,
      lastAddedBy:    item.addedBy,
      lastCheckedAt:  undefined,
      lastCheckedBy:  undefined,
      prevPurchaseAt: undefined,
      prevPurchaseBy: undefined,
    };
  }

  readonly rayonPill = computed(() => {
    const p = this.product();
    if (!p) return null;
    const meta = RAYON_META[p.rayon as Rayon] ?? RAYON_META['inconnue'];
    return meta;
  });

  readonly chartMax = computed(() => {
    const p = this.product();
    if (!p || !p.monthlyPurchases.length) return 4;
    return Math.max(4, ...p.monthlyPurchases.map(m => m.count));
  });

  // Chart: visible dès le 1er achat archivé
  readonly hasChart = computed(() => {
    const p = this.product();
    return !!p && p.monthlyPurchases.some(m => m.count > 0);
  });

  // Estimation : nécessite ≥2 achats avec intervalle cohérent
  readonly hasData = computed(() => {
    const p = this.product();
    return !!p && p.estimatedDays > 0;
  });

  barHeight(item: MonthlyPurchase): string {
    const max = this.chartMax();
    if (max === 0 || item.count === 0) return '0%';
    return `${(item.count / max) * 100}%`;
  }

  isRecentMonth(index: number): boolean {
    const p = this.product();
    if (!p) return false;
    return index >= p.monthlyPurchases.length - 2;
  }

  avgLabel(): string {
    const p = this.product();
    if (!p) return '';
    const days = p.avgDays;
    if (days >= 30) return `~${Math.round(days / 30)} mois`;
    if (days >= 14) return `~${Math.round(days / 7)} semaines`;
    if (days >= 7)  return `~1 semaine`;
    return `~${days} jours`;
  }

  // ── Rayon picker ──
  showRayonPicker = signal(false);
  readonly rayonOptions = RAYON_ORDER.map(r => ({ rayon: r, meta: RAYON_META[r] }));

  openRayonPicker() { this.showRayonPicker.set(true); }
  closeRayonPicker() { this.showRayonPicker.set(false); }

  selectRayon(rayon: Rayon) {
    const p = this.product();
    if (p) this.history.setProductRayon(p.id, rayon);
    this.closeRayonPicker();
  }

  addToList() {
    const p   = this.product();
    const uid = this.session.uid;
    if (!p || !uid) return;
    this.list.add(p.name, p.rayon as Rayon, uid);
    this.router.navigate(['/list']);
  }

  back() {
    this.location.back();
  }
}
