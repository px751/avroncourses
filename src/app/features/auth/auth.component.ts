import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MembersService } from '../../core/services/members.service';
import { SessionService } from '../../core/services/session.service';
import { Member } from '../../core/models';
import { WheelColComponent } from '../../shared/components/wheel-col.component';
import { MemberColorPipe } from '../../shared/pipes/member-color.pipe';

const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const DAYS   = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS  = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [WheelColComponent, MemberColorPipe],
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  private membersService = inject(MembersService);
  private session  = inject(SessionService);
  private router   = inject(Router);

  readonly memberList = this.membersService.all;
  readonly days   = DAYS;
  readonly months = MONTHS;
  readonly years  = YEARS;

  step            = signal<'select' | 'dob'>('select');
  selectedMember  = signal<Member | null>(null);
  dobDay          = signal(DAYS[11]);   // 12
  dobMonth        = signal(MONTHS[2]);  // mars
  dobYear         = signal('1990');
  authError       = signal(false);

  formattedDob = computed(() =>
    `${this.dobDay()} ${this.dobMonth()} ${this.dobYear()}`
  );

  selectMember(member: Member) {
    this.selectedMember.set(member);
    this.authError.set(false);
    this.step.set('dob');
  }

  back() {
    this.step.set('select');
    this.authError.set(false);
  }

  login() {
    const member = this.selectedMember();
    if (!member) return;

    const day   = parseInt(this.dobDay(), 10);
    const month = MONTHS.indexOf(this.dobMonth()) + 1;
    const year  = parseInt(this.dobYear(), 10);

    if (!this.membersService.validateBirthDate(member.id, day, month, year)) {
      this.authError.set(true);
      return;
    }

    this.session.login(member);
    this.router.navigate(['/list']);
  }
}
