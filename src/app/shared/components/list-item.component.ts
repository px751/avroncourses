import { Component, input, output, inject } from '@angular/core';
import { ListItem, Rayon } from '../../core/models';
import { MemberColorPipe } from '../pipes/member-color.pipe';
import { MembersService } from '../../core/services/members.service';

const RAYON_STYLES: Record<Rayon, { dot: string; text: string; bg: string; border?: string; label: string }> = {
  fruits:   { dot: '#1A8F5C', text: '#137A4E', bg: '#E7F2EA', label: 'Fruits & légumes' },
  frais:    { dot: '#3E7FB8', text: '#356E9E', bg: '#E7EFF6', label: 'Frais' },
  epicerie: { dot: '#E8A33D', text: '#B07A1E', bg: '#F8EFDC', label: 'Épicerie' },
  inconnue: { dot: '#A89C86', text: '#8E8270', bg: '#EFEADC', border: '#D8CDB6', label: 'Inconnue' },
};

@Component({
  selector: 'app-list-item',
  standalone: true,
  imports: [MemberColorPipe],
  template: `
    <div
      class="flex items-center gap-[14px] px-4 py-[13px]"
      [class.border-b]="!last()"
      style="border-color: #F1EADC"
      [style.background]="item().checked ? '#F7F3E9' : '#fff'">

      <!-- Case à cocher -->
      <button
        (click)="toggle.emit(item().id)"
        class="w-[26px] h-[26px] rounded-full flex-none flex items-center justify-center transition-all"
        [style.background]="item().checked ? 'var(--color-ac)' : 'transparent'"
        [style.border]="item().checked ? 'none' : '2.5px solid #D8CDB6'">
        @if (item().checked) {
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff">
            <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
          </svg>
        }
      </button>

      <!-- Nom + pill rayon -->
      <div class="flex-1 min-w-0">
        <div class="text-[16.5px] font-medium"
             [style.color]="item().checked ? '#B3AB9A' : '#211C16'"
             [style.text-decoration]="item().checked ? 'line-through' : 'none'">
          {{ item().name }}
        </div>
        @if (showRayon()) {
          <span class="inline-flex items-center gap-[6px] rounded-full text-[11.5px] font-semibold px-[9px] py-[2px] mt-[5px]"
                [style.color]="rayonStyle().text"
                [style.background]="rayonStyle().bg"
                [style.border]="rayonStyle().border ? '1px dashed ' + rayonStyle().border : 'none'">
            <span class="w-[6px] h-[6px] rounded-full flex-none"
                  [style.background]="rayonStyle().dot"></span>
            {{ rayonStyle().label }}
          </span>
        }
      </div>

      <!-- Avatar auteur -->
      @let author = members.getById(item().addedBy);
      @if (author) {
        @let color = author.colorIndex | memberColor;
        <div class="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[12px] font-bold flex-none"
             [style.background]="item().checked ? '#EFEADC' : color.bg"
             [style.color]="item().checked ? '#B3AB9A' : color.text">
          {{ author.avatarLetter }}
        </div>
      }
    </div>
  `,
})
export class ListItemComponent {
  item      = input.required<ListItem>();
  last      = input(false);
  showRayon = input(false);
  toggle    = output<string>();

  members = inject(MembersService);

  rayonStyle() { return RAYON_STYLES[this.item().rayon]; }
}
