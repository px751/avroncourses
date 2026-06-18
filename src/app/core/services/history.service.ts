import { Injectable, signal, computed } from '@angular/core';
import { ArchivedList, Rayon } from '../models';
import { RAYON_META } from '../utils/rayon';

function d(year: number, month: number, day: number) {
  return new Date(year, month - 1, day).getTime();
}

const MOCK_LISTS: ArchivedList[] = [
  { id: 'h1', date: d(2026, 6, 14), participants: ['antoine', 'marie'],
    items: Array(18).fill(null).map((_, i) => ({
      id: `h1-${i}`, name: '', rayon: 'epicerie' as const,
      checked: true, addedBy: 'antoine', addedAt: 0,
    })) },
  { id: 'h2', date: d(2026, 6,  7), participants: ['marie'],
    items: Array(22).fill(null).map((_, i) => ({
      id: `h2-${i}`, name: '', rayon: 'frais' as const,
      checked: true, addedBy: 'marie', addedAt: 0,
    })) },
  { id: 'h3', date: d(2026, 6,  1), participants: ['antoine'],
    items: Array(15).fill(null).map((_, i) => ({
      id: `h3-${i}`, name: '', rayon: 'fruits' as const,
      checked: true, addedBy: 'antoine', addedAt: 0,
    })) },
  { id: 'h4', date: d(2026, 5, 24), participants: ['antoine', 'marie'],
    items: Array(19).fill(null).map((_, i) => ({
      id: `h4-${i}`, name: '', rayon: 'epicerie' as const,
      checked: true, addedBy: 'marie', addedAt: 0,
    })) },
  { id: 'h5', date: d(2026, 5, 16), participants: ['marie'],
    items: Array(12).fill(null).map((_, i) => ({
      id: `h5-${i}`, name: '', rayon: 'frais' as const,
      checked: true, addedBy: 'marie', addedAt: 0,
    })) },
];

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

const MOCK_PRODUCTS: ProductStat[] = [
  {
    id: 'p1', name: 'Lait demi-écrémé', rayon: 'frais',
    rayonDot: '#3E7FB8', rayonLabel: 'Frais',
    purchaseCount: 11, estimatedDays: 5, avgDays: 14,
    monthlyPurchases: [
      { month: 'déc', count: 2 }, { month: 'jan', count: 3 },
      { month: 'fév', count: 2 }, { month: 'mar', count: 3 },
      { month: 'avr', count: 2 }, { month: 'mai', count: 4 },
      { month: 'juin', count: 3 },
    ],
    lastAddedAt: d(2026, 6, 7), lastAddedBy: 'marie',
    lastCheckedAt: d(2026, 6, 8), lastCheckedBy: 'marie',
    prevPurchaseAt: d(2026, 5, 24), prevPurchaseBy: 'antoine',
  },
  {
    id: 'p2', name: 'Bananes', rayon: 'fruits',
    rayonDot: '#1A8F5C', rayonLabel: 'Fruits & lég.',
    purchaseCount: 14, estimatedDays: 3, avgDays: 7,
    monthlyPurchases: [
      { month: 'déc', count: 2 }, { month: 'jan', count: 3 },
      { month: 'fév', count: 2 }, { month: 'mar', count: 4 },
      { month: 'avr', count: 3 }, { month: 'mai', count: 4 },
      { month: 'juin', count: 3 },
    ],
    lastAddedAt: d(2026, 6, 14), lastAddedBy: 'antoine',
    lastCheckedAt: d(2026, 6, 14), lastCheckedBy: 'antoine',
    prevPurchaseAt: d(2026, 6, 7), prevPurchaseBy: 'marie',
  },
  {
    id: 'p3', name: 'Café moulu', rayon: 'epicerie',
    rayonDot: '#E8A33D', rayonLabel: 'Épicerie',
    purchaseCount: 6, estimatedDays: 12, avgDays: 30,
    monthlyPurchases: [
      { month: 'jan', count: 1 }, { month: 'fév', count: 0 },
      { month: 'mar', count: 1 }, { month: 'avr', count: 2 },
      { month: 'mai', count: 1 }, { month: 'juin', count: 1 },
    ],
    lastAddedAt: d(2026, 6, 1), lastAddedBy: 'antoine',
    lastCheckedAt: d(2026, 6, 1), lastCheckedBy: 'antoine',
    prevPurchaseAt: d(2026, 5, 2), prevPurchaseBy: 'antoine',
  },
  {
    id: 'p4', name: 'Œufs ×6', rayon: 'frais',
    rayonDot: '#3E7FB8', rayonLabel: 'Frais',
    purchaseCount: 9, estimatedDays: 6, avgDays: 14,
    monthlyPurchases: [
      { month: 'jan', count: 2 }, { month: 'fév', count: 1 },
      { month: 'mar', count: 2 }, { month: 'avr', count: 2 },
      { month: 'mai', count: 2 }, { month: 'juin', count: 2 },
    ],
    lastAddedAt: d(2026, 6, 7), lastAddedBy: 'marie',
    lastCheckedAt: d(2026, 6, 8), lastCheckedBy: 'marie',
    prevPurchaseAt: d(2026, 5, 24), prevPurchaseBy: 'antoine',
  },
  {
    id: 'p5', name: 'Pain de mie', rayon: 'epicerie',
    rayonDot: '#E8A33D', rayonLabel: 'Épicerie',
    purchaseCount: 12, estimatedDays: 4, avgDays: 7,
    monthlyPurchases: [
      { month: 'déc', count: 2 }, { month: 'jan', count: 3 },
      { month: 'fév', count: 3 }, { month: 'mar', count: 3 },
      { month: 'avr', count: 2 }, { month: 'mai', count: 3 },
      { month: 'juin', count: 3 },
    ],
    lastAddedAt: d(2026, 6, 14), lastAddedBy: 'antoine',
    lastCheckedAt: d(2026, 6, 14), lastCheckedBy: 'antoine',
    prevPurchaseAt: d(2026, 6, 7), prevPurchaseBy: 'marie',
  },
  {
    id: 'p6', name: 'Yaourts nature', rayon: 'frais',
    rayonDot: '#3E7FB8', rayonLabel: 'Frais',
    purchaseCount: 10, estimatedDays: 8, avgDays: 21,
    monthlyPurchases: [
      { month: 'jan', count: 1 }, { month: 'fév', count: 2 },
      { month: 'mar', count: 2 }, { month: 'avr', count: 2 },
      { month: 'mai', count: 2 }, { month: 'juin', count: 2 },
    ],
    lastAddedAt: d(2026, 6, 7), lastAddedBy: 'marie',
    lastCheckedAt: d(2026, 6, 8), lastCheckedBy: 'marie',
    prevPurchaseAt: d(2026, 5, 17), prevPurchaseBy: 'marie',
  },
  {
    id: 'p7', name: 'Tomates', rayon: 'fruits',
    rayonDot: '#1A8F5C', rayonLabel: 'Fruits & lég.',
    purchaseCount: 8, estimatedDays: 7, avgDays: 10,
    monthlyPurchases: [
      { month: 'fév', count: 1 }, { month: 'mar', count: 2 },
      { month: 'avr', count: 2 }, { month: 'mai', count: 2 },
      { month: 'juin', count: 2 },
    ],
    lastAddedAt: d(2026, 6, 7), lastAddedBy: 'antoine',
    lastCheckedAt: d(2026, 6, 7), lastCheckedBy: 'antoine',
    prevPurchaseAt: d(2026, 5, 28), prevPurchaseBy: 'marie',
  },
  {
    id: 'p8', name: 'Beurre', rayon: 'frais',
    rayonDot: '#3E7FB8', rayonLabel: 'Frais',
    purchaseCount: 7, estimatedDays: 10, avgDays: 30,
    monthlyPurchases: [
      { month: 'jan', count: 1 }, { month: 'mar', count: 2 },
      { month: 'avr', count: 1 }, { month: 'mai', count: 2 },
      { month: 'juin', count: 1 },
    ],
    lastAddedAt: d(2026, 6, 1), lastAddedBy: 'marie',
    lastCheckedAt: d(2026, 6, 1), lastCheckedBy: 'marie',
    prevPurchaseAt: d(2026, 5, 2), prevPurchaseBy: 'antoine',
  },
  {
    id: 'p9', name: 'Sopalin', rayon: 'inconnue',
    rayonDot: '#A89C86', rayonLabel: 'Inconnue',
    purchaseCount: 1, estimatedDays: 0, avgDays: 0,
    monthlyPurchases: [],
    lastAddedAt: d(2026, 6, 11), lastAddedBy: 'antoine',
  },
];

@Injectable({ providedIn: 'root' })
export class HistoryService {
  readonly lists    = signal<ArchivedList[]>(MOCK_LISTS);
  readonly products = signal<ProductStat[]>(MOCK_PRODUCTS);
  readonly productSearch = signal('');

  readonly filteredProducts = computed(() => {
    const q = this.productSearch().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    if (!q) return this.products();
    return this.products().filter(p =>
      p.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(q)
    );
  });

  getProductById(id: string): ProductStat | undefined {
    return this.products().find(p => p.id === id);
  }

  getProductByName(name: string): ProductStat | undefined {
    const n = name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    return this.products().find(p =>
      p.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') === n
    );
  }

  setProductRayon(id: string, rayon: Rayon) {
    const m = RAYON_META[rayon];
    this.products.update(list => list.map(p =>
      p.id === id ? { ...p, rayon, rayonDot: m.dot, rayonLabel: m.label } : p
    ));
  }

  archiveList(items: import('../models').ListItem[], participants: string[]) {
    const archived: import('../models').ArchivedList = {
      id: 'a' + Date.now(),
      date: Date.now(),
      items,
      participants,
    };
    this.lists.update(l => [archived, ...l]);
  }

  deleteList(id: string) {
    this.lists.update(l => l.filter(x => x.id !== id));
  }
}
