import { Injectable } from '@angular/core';
import { Member } from '../models';

// Modifier ici les membres et leurs dates de naissance (format YYYY-MM-DD)
// colorIndex : position dans MEMBER_COLORS (modulo 10 automatique)
const MEMBERS_CONFIG: Member[] = [
  { id: 'antoine', name: 'Antoine', birthDate: '1990-03-12', avatarLetter: 'A', colorIndex: 0 },
  { id: 'marie',   name: 'Marie',   birthDate: '1992-07-24', avatarLetter: 'M', colorIndex: 1 },
];

@Injectable({ providedIn: 'root' })
export class MembersService {
  readonly all: Member[] = MEMBERS_CONFIG;

  getById(id: string): Member | undefined {
    return this.all.find(m => m.id === id);
  }

  validateBirthDate(memberId: string, day: number, month: number, year: number): boolean {
    const member = this.getById(memberId);
    if (!member) return false;
    const [y, mo, d] = member.birthDate.split('-').map(Number);
    return d === day && mo === month && y === year;
  }
}
