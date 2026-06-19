import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth, authState,
  GoogleAuthProvider,
  signInWithPopup, signOut,
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

  async loginWithGoogle(): Promise<void> {
    // signInWithPopup works in all contexts (browser + iOS PWA standalone).
    // signInWithRedirect breaks iOS PWA: the redirect opens in Safari which has
    // a separate localStorage, so the auth result never reaches the PWA.
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
