import { Injectable, signal } from '@angular/core';
import { Member } from '../models';

const STORAGE_KEY = 'avroncourse_session';

@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly currentMember = signal<Member | null>(this.load());

  login(member: Member): void {
    this.currentMember.set(member);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
  }

  logout(): void {
    this.currentMember.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private load(): Member | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
