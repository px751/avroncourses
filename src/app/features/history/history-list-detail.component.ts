import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { HistoryService } from '../../core/services/history.service';
import { MembersService } from '../../core/services/members.service';
import { ListService } from '../../core/services/list.service';
import { SessionService } from '../../core/services/session.service';
import { RAYON_META } from '../../core/utils/rayon';
import { FrenchDatePipe } from '../../shared/pipes/french-date.pipe';
import { Rayon } from '../../core/models';

@Component({
  selector: 'app-history-list-detail',
  standalone: true,
  imports: [FrenchDatePipe],
  templateUrl: './history-list-detail.component.html',
})
export class HistoryListDetailComponent {
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private history = inject(HistoryService);
  private members = inject(MembersService);
  private listSvc = inject(ListService);
  private session = inject(SessionService);

  private listId = toSignal(this.route.paramMap.pipe(map(p => p.get('id') ?? '')));

  readonly archivedList = computed(() =>
    this.history.lists().find(l => l.id === this.listId())
  );

  readonly participantInitials = computed(() => {
    const list = this.archivedList();
    if (!list) return '';
    return list.participants
      .map(pid => this.members.getById(pid)?.avatarLetter ?? '?')
      .join(' + ');
  });

  // Selected item names (all checked by default when list loads)
  readonly checkedNames = signal<Set<string>>(new Set());

  constructor() {
    effect(() => {
      const list = this.archivedList();
      if (list && this.checkedNames().size === 0) {
        this.checkedNames.set(new Set(list.items.map(i => i.name)));
      }
    }, { allowSignalWrites: true });
  }

  isChecked(name: string): boolean {
    return this.checkedNames().has(name);
  }

  toggle(name: string) {
    this.checkedNames.update(s => {
      const next = new Set(s);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  selectAll() {
    const list = this.archivedList();
    if (list) this.checkedNames.set(new Set(list.items.map(i => i.name)));
  }

  readonly selectedCount = computed(() => this.checkedNames().size);

  rayon(r: string) {
    return RAYON_META[r as Rayon] ?? RAYON_META['inconnue'];
  }

  addToList() {
    const list = this.archivedList();
    const uid  = this.session.uid;
    if (!list || !uid) return;
    const checked = this.checkedNames();
    list.items
      .filter(i => checked.has(i.name))
      .forEach(i => this.listSvc.add(i.name, i.rayon, uid));
    this.router.navigate(['/list']);
  }

  back() { this.router.navigate(['/history']); }
}
