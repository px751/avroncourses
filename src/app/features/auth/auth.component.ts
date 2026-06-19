import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { MembersService } from '../../core/services/members.service';
import { SessionService } from '../../core/services/session.service';
import { MemberColorPipe } from '../../shared/pipes/member-color.pipe';
import { MEMBER_COLORS } from '../../core/utils/member-colors';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [MemberColorPipe],
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  private auth    = inject(Auth);
  private session = inject(SessionService);
  private members = inject(MembersService);
  private router  = inject(Router);

  step                = signal<'login' | 'profile'>('login');
  loading             = signal(false);
  error               = signal('');
  newName             = signal('');
  selectedColorIndex  = signal(0);
  private pendingUser: User | null = null;

  readonly colorPalette = MEMBER_COLORS;

  readonly suggestedColorIndex = computed(() => {
    const taken = this.members.all().map(m => m.colorIndex);
    for (let i = 0; i < MEMBER_COLORS.length; i++) {
      if (!taken.includes(i)) return i;
    }
    return taken.length % MEMBER_COLORS.length;
  });

  async ngOnInit() {
    // If already signed in (e.g. token persisted), go straight through
    const existingUser = this.auth.currentUser;
    if (existingUser) await this.handleUser(existingUser);
  }

  private async handleUser(user: User): Promise<void> {
    const member = await this.members.getMemberDoc(user.uid);
    if (member) {
      this.router.navigate(['/list']);
    } else {
      this.pendingUser = user;
      this.newName.set(user.displayName?.split(' ')[0] ?? '');
      this.selectedColorIndex.set(this.suggestedColorIndex());
      this.step.set('profile');
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.session.loginWithGoogle();
      const user = this.auth.currentUser;
      if (user) await this.handleUser(user);
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') {
        this.error.set('Connexion annulée.');
      } else if (e.code !== 'auth/cancelled-popup-request') {
        this.error.set('Connexion échouée. Réessaie.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  setName(e: Event) {
    this.newName.set((e.target as HTMLInputElement).value);
  }

  async createProfile(): Promise<void> {
    if (!this.pendingUser || !this.newName().trim()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      await this.members.createMember(
        this.pendingUser.uid,
        this.newName(),
        this.selectedColorIndex(),
      );
      this.router.navigate(['/list']);
    } catch {
      this.error.set('Erreur. Réessaie.');
      this.loading.set(false);
    }
  }
}
