import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth, authState,
  GoogleAuthProvider,
  signInWithPopup, signInWithRedirect, getRedirectResult, signOut,
} from '@angular/fire/auth';
import { MembersService } from './members.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private auth    = inject(Auth);
  private members = inject(MembersService);

  readonly currentUser = toSignal(authState(this.auth), { initialValue: null });

  readonly currentMember = computed(() => {
    const user = this.currentUser();
    if (!user) return null;
    return this.members.getById(user.uid) ?? null;
  });

  get uid(): string | null {
    return this.currentUser()?.uid ?? null;
  }

  loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return signInWithRedirect(this.auth, provider);
    }
    return signInWithPopup(this.auth, provider).then();
  }

  getRedirectResult() {
    return getRedirectResult(this.auth);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
