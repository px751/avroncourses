import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HistoryService } from '../../core/services/history.service';
import { MembersService } from '../../core/services/members.service';
import { MemberColorPipe } from '../../shared/pipes/member-color.pipe';
import { FrenchDatePipe } from '../../shared/pipes/french-date.pipe';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [FormsModule, RouterLink, MemberColorPipe, FrenchDatePipe],
  templateUrl: './history.component.html',
})
export class HistoryComponent {
  private router = inject(Router);
  readonly history = inject(HistoryService);
  readonly members = inject(MembersService);

  tab = signal<'lists' | 'products'>('lists');

  // Swipe-to-delete state
  swipedId = signal<string | null>(null);
  swipeX   = signal(0);
  private startX         = 0;
  private startY         = 0;
  private dragging       = false;
  private directionLocked: 'h' | 'v' | null = null;
  readonly SWIPE_THRESHOLD   = 60;
  readonly SWIPE_OPEN        = -84;
  readonly DIRECTION_LOCK_PX = 8;

  onPointerDown(e: PointerEvent, id: string) {
    if (this.swipedId() !== id) {
      this.swipedId.set(null);
      this.swipeX.set(0);
    }
    this.startX          = e.clientX - (this.swipedId() === id ? this.swipeX() : 0);
    this.startY          = e.clientY;
    this.dragging        = true;
    this.directionLocked = null;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  onPointerMove(e: PointerEvent, id: string) {
    if (!this.dragging) return;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (!this.directionLocked && dist >= this.DIRECTION_LOCK_PX) {
      this.directionLocked = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
    }
    if (this.directionLocked === 'v') return;
    if (!this.directionLocked && Math.abs(dy) > Math.abs(dx)) return;

    this.swipedId.set(id);
    this.swipeX.set(Math.max(this.SWIPE_OPEN, Math.min(0, dx)));
  }

  onPointerUp(id: string) {
    if (!this.dragging) return;
    this.dragging = false;
    if (this.swipeX() < -this.SWIPE_THRESHOLD) {
      this.swipeX.set(this.SWIPE_OPEN);
    } else {
      this.swipedId.set(null);
      this.swipeX.set(0);
    }
  }

  cardOffset(id: string): number {
    return this.swipedId() === id ? this.swipeX() : 0;
  }

  deleteList(id: string) {
    this.history.deleteList(id);
    this.swipedId.set(null);
  }

  memberFor(id: string) {
    return this.members.getById(id);
  }

  back() { this.router.navigate(['/list']); }
}
