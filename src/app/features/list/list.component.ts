import { Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ListService } from '../../core/services/list.service';
import { SessionService } from '../../core/services/session.service';
import { MembersService } from '../../core/services/members.service';
import { HistoryService } from '../../core/services/history.service';
import { ListItemComponent } from '../../shared/components/list-item.component';
import { Rayon } from '../../core/models';
import { MemberColorPipe } from '../../shared/pipes/member-color.pipe';
import { RAYON_META } from '../../core/utils/rayon';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink, ListItemComponent, MemberColorPipe],
  templateUrl: './list.component.html',
})
export class ListComponent {
  private router  = inject(Router);
  readonly list    = inject(ListService);
  readonly session = inject(SessionService);
  readonly members = inject(MembersService);
  readonly history = inject(HistoryService);

  // ── Swipe state ──
  swipedId      = signal<string | null>(null);
  swipeX        = signal(0);   // negative = left (delete), positive = right (rayon)
  isDragging    = signal(false);
  isSwipingH    = signal(false); // true = horizontal swipe locked → touch-action: none
  private startX         = 0;
  private startY         = 0;
  private dragging       = false;
  private hasMoved       = false;
  private directionLocked: 'h' | 'v' | null = null;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;

  // Thresholds
  readonly DELETE_TRIGGER  = 80;
  readonly RAYON_TRIGGER   = 60;
  readonly MAX_LEFT        = 100;
  readonly MAX_RIGHT       = 80;
  readonly DIRECTION_LOCK_PX = 8;  // pixels before locking direction

  // ── Rayon picker sheet ──
  rayonPickerId = signal<string | null>(null); // id de l'item dont on change le rayon
  readonly rayonOptions = (['fruits', 'frais', 'epicerie', 'inconnue'] as Rayon[])
    .map(r => ({ rayon: r, meta: RAYON_META[r] }));

  openRayonPicker(id: string) { this.rayonPickerId.set(id); }
  closeRayonPicker()          { this.rayonPickerId.set(null); }

  selectRayon(rayon: Rayon) {
    const id = this.rayonPickerId();
    if (id) this.list.setRayon(id, rayon);
    this.closeRayonPicker();
  }

  currentRayon(id: string): Rayon | null {
    return this.list.items().find(i => i.id === id)?.rayon ?? null;
  }

  // ── Archive sheet ──
  showArchiveConfirm = signal(false);

  onPointerDown(e: PointerEvent, id: string) {
    // Reset any previously open item
    this.swipedId.set(null);
    this.swipeX.set(0);
    this.startX          = e.clientX;
    this.startY          = e.clientY;
    this.dragging        = true;
    this.hasMoved        = false;
    this.directionLocked = null;
    this.isDragging.set(true);
    this.isSwipingH.set(false);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    this.longPressTimer = setTimeout(() => {
      if (!this.hasMoved) {
        const item = this.list.items().find(i => i.id === id);
        if (item) {
          const product = this.history.getProductByName(item.name);
          if (product) this.router.navigate(['/product', product.id]);
        }
      }
    }, 500);
  }

  onPointerMove(e: PointerEvent, id: string) {
    if (!this.dragging) return;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Cancel long press on any significant movement
    if (dist > 5 && !this.hasMoved) {
      this.hasMoved = true;
      if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
    }

    // Lock direction once we've moved enough to be sure
    if (!this.directionLocked && dist >= this.DIRECTION_LOCK_PX) {
      this.directionLocked = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
      if (this.directionLocked === 'h') this.isSwipingH.set(true);
    }

    // Before lock: allow small horizontal hints through; after lock: only process horizontal
    if (this.directionLocked === 'v') return;
    if (!this.directionLocked && Math.abs(dy) > Math.abs(dx)) return;

    this.swipedId.set(id);
    this.swipeX.set(Math.max(-this.MAX_LEFT, Math.min(this.MAX_RIGHT, dx)));
  }

  onPointerUp(id: string) {
    if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
    if (!this.dragging) return;
    this.dragging = false;
    this.isDragging.set(false);
    this.isSwipingH.set(false);

    const x = this.swipeX();
    if (x < -this.DELETE_TRIGGER) {
      // Animate off-screen then delete
      this.swipeX.set(-400);
      setTimeout(() => {
        this.list.remove(id);
        this.swipedId.set(null);
        this.swipeX.set(0);
      }, 180);
    } else if (x > this.RAYON_TRIGGER) {
      this.swipedId.set(null);
      this.swipeX.set(0);
      this.openRayonPicker(id);
    } else {
      this.swipedId.set(null);
      this.swipeX.set(0);
    }
  }

  cardOffset(id: string): number {
    return this.swipedId() === id ? this.swipeX() : 0;
  }

  isPastDeleteTrigger(id: string): boolean {
    return this.swipedId() === id && this.swipeX() < -this.DELETE_TRIGGER;
  }

  isPastRayonTrigger(id: string): boolean {
    return this.swipedId() === id && this.swipeX() > this.RAYON_TRIGGER;
  }

  deletePanel(id: string): number {
    return this.swipedId() === id ? Math.max(0, -this.swipeX()) : 0;
  }

  rayonPanel(id: string): number {
    return this.swipedId() === id ? Math.max(0, this.swipeX()) : 0;
  }

  archiveConfirm() { this.showArchiveConfirm.set(true); }
  archiveCancel()  { this.showArchiveConfirm.set(false); }

  archiveKeepUnchecked() {
    const all = this.list.items();
    const participants = [...new Set(all.map(i => i.addedBy))];
    const checked = this.list.archiveKeepUnchecked();
    this.history.archiveList(checked, participants);
    this.showArchiveConfirm.set(false);
  }

  archiveDeleteUnchecked() {
    const all = this.list.items();
    const participants = [...new Set(all.map(i => i.addedBy))];
    const checked = this.list.archiveAll();
    this.history.archiveList(checked, participants);
    this.showArchiveConfirm.set(false);
  }

  rayonDot(r: Rayon)   { return RAYON_META[r].dot; }
  rayonText(r: Rayon)  { return RAYON_META[r].text; }
  rayonLabel(r: Rayon) { return RAYON_META[r].label; }
}
