import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore, collection, collectionData, query, orderBy,
  doc, addDoc, updateDoc, deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ListItem, Rayon, ListViewMode } from '../models';

const RAYON_ORDER: Rayon[] = ['fruits', 'frais', 'epicerie', 'inconnue'];

@Injectable({ providedIn: 'root' })
export class ListService {
  private fs = inject(Firestore);
  private listRef = collection(this.fs, 'lists');

  readonly items: Signal<ListItem[]>;
  readonly viewMode = signal<ListViewMode>('flat');

  readonly uncheckedCount: Signal<number>;
  readonly checkedCount: Signal<number>;
  readonly totalCount: Signal<number>;
  readonly progress: Signal<number>;
  readonly byRayon: Signal<{ rayon: Rayon; items: ListItem[] }[]>;

  constructor() {
    const items$ = collectionData(
      query(this.listRef, orderBy('addedAt', 'asc')),
      { idField: 'id' },
    ) as Observable<ListItem[]>;

    this.items = toSignal(items$, { initialValue: [] });

    this.uncheckedCount = computed(() => this.items().filter(i => !i.checked).length);
    this.checkedCount   = computed(() => this.items().filter(i =>  i.checked).length);
    this.totalCount     = computed(() => this.items().length);
    this.progress       = computed(() =>
      this.totalCount() === 0 ? 0 : this.checkedCount() / this.totalCount()
    );

    this.byRayon = computed(() => {
      const grouped = new Map<Rayon, ListItem[]>();
      for (const r of RAYON_ORDER) grouped.set(r, []);
      for (const item of this.items()) grouped.get(item.rayon)!.push(item);
      return [...grouped.entries()]
        .filter(([, its]) => its.length > 0)
        .map(([rayon, its]) => ({ rayon, items: its }));
    });
  }

  toggle(id: string) {
    const item = this.items().find(i => i.id === id);
    if (!item) return;
    updateDoc(doc(this.fs, 'lists', id), { checked: !item.checked });
  }

  add(name: string, rayon: Rayon, addedBy: string) {
    addDoc(this.listRef, { name, rayon, checked: false, addedBy, addedAt: Date.now() });
  }

  remove(id: string) {
    deleteDoc(doc(this.fs, 'lists', id));
  }

  setRayon(id: string, rayon: Rayon) {
    updateDoc(doc(this.fs, 'lists', id), { rayon });
  }

  archiveKeepUnchecked() {
    this.items().filter(i => i.checked)
      .forEach(i => deleteDoc(doc(this.fs, 'lists', i.id)));
  }

  archiveAll() {
    this.items().forEach(i => deleteDoc(doc(this.fs, 'lists', i.id)));
  }

  setViewMode(mode: ListViewMode) {
    this.viewMode.set(mode);
  }
}
