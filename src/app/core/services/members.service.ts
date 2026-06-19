import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore, collection, collectionData, query, orderBy,
  doc, getDoc, setDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Member } from '../models';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private fs = inject(Firestore);
  private membersRef = collection(this.fs, 'members');

  readonly all: Signal<Member[]>;

  constructor() {
    const members$ = collectionData(
      query(this.membersRef, orderBy('colorIndex')),
      { idField: 'id' },
    ) as Observable<Member[]>;

    this.all = toSignal(members$, { initialValue: [] });
  }

  getById(id: string): Member | undefined {
    return this.all().find(m => m.id === id);
  }

  async getMemberDoc(uid: string): Promise<Member | null> {
    const snap = await getDoc(doc(this.fs, 'members', uid));
    if (!snap.exists()) return null;
    return { id: uid, ...(snap.data() as Omit<Member, 'id'>) };
  }

  async createMember(uid: string, name: string, colorIndex: number): Promise<void> {
    await setDoc(doc(this.fs, 'members', uid), {
      name: name.trim(),
      avatarLetter: name.trim().charAt(0).toUpperCase(),
      colorIndex,
      createdAt: Date.now(),
    });
  }
}
