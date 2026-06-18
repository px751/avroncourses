import { Injectable, signal, computed } from '@angular/core';
import { ListItem, Rayon, ListViewMode } from '../models';

const MOCK_ITEMS: ListItem[] = [
  { id: '1', name: 'Bananes',        rayon: 'fruits',   checked: false, addedBy: 'antoine', addedAt: Date.now() },
  { id: '2', name: 'Lait demi-écrémé', rayon: 'frais',  checked: false, addedBy: 'marie',   addedAt: Date.now() },
  { id: '3', name: 'Pain de mie',    rayon: 'epicerie', checked: true,  addedBy: 'antoine', addedAt: Date.now() },
  { id: '4', name: 'Œufs ×6',        rayon: 'frais',   checked: false, addedBy: 'marie',   addedAt: Date.now() },
  { id: '5', name: 'Yaourts nature', rayon: 'frais',    checked: true,  addedBy: 'marie',   addedAt: Date.now() },
  { id: '6', name: 'Café moulu',     rayon: 'epicerie', checked: false, addedBy: 'antoine', addedAt: Date.now() },
  { id: '7', name: 'Sopalin',        rayon: 'inconnue', checked: false, addedBy: 'antoine', addedAt: Date.now() },
];

const RAYON_ORDER: Rayon[] = ['fruits', 'frais', 'epicerie', 'inconnue'];

@Injectable({ providedIn: 'root' })
export class ListService {
  readonly items    = signal<ListItem[]>(MOCK_ITEMS);
  readonly viewMode = signal<ListViewMode>('flat');

  readonly uncheckedCount = computed(() => this.items().filter(i => !i.checked).length);
  readonly checkedCount   = computed(() => this.items().filter(i =>  i.checked).length);
  readonly totalCount     = computed(() => this.items().length);
  readonly progress       = computed(() =>
    this.totalCount() === 0 ? 0 : this.checkedCount() / this.totalCount()
  );

  readonly byRayon = computed(() => {
    const grouped = new Map<Rayon, ListItem[]>();
    for (const r of RAYON_ORDER) grouped.set(r, []);
    for (const item of this.items()) {
      grouped.get(item.rayon)!.push(item);
    }
    return [...grouped.entries()]
      .filter(([, items]) => items.length > 0)
      .map(([rayon, items]) => ({ rayon, items }));
  });

  toggle(id: string) {
    this.items.update(list =>
      list.map(i => i.id === id ? { ...i, checked: !i.checked } : i)
    );
  }

  add(name: string, rayon: Rayon, addedBy: string) {
    const item: ListItem = {
      id: crypto.randomUUID(),
      name, rayon, checked: false, addedBy,
      addedAt: Date.now(),
    };
    this.items.update(list => [...list, item]);
  }

  remove(id: string) {
    this.items.update(list => list.filter(i => i.id !== id));
  }

  setRayon(id: string, rayon: Rayon) {
    this.items.update(list =>
      list.map(i => i.id === id ? { ...i, rayon } : i)
    );
  }

  cycleRayon(id: string) {
    const item = this.items().find(i => i.id === id);
    if (!item) return;
    const idx = RAYON_ORDER.indexOf(item.rayon);
    const next = RAYON_ORDER[(idx + 1) % RAYON_ORDER.length];
    this.setRayon(id, next);
  }

  archiveKeepUnchecked(): ListItem[] {
    const checked = this.items().filter(i => i.checked);
    this.items.update(list => list.filter(i => !i.checked));
    return checked;
  }

  archiveAll(): ListItem[] {
    const all = this.items();
    this.items.set([]);
    return all.filter(i => i.checked);
  }

  setViewMode(mode: ListViewMode) {
    this.viewMode.set(mode);
  }
}
