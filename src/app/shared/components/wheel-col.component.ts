import {
  Component, input, model,
  viewChild, ElementRef,
  AfterViewInit, OnChanges,
} from '@angular/core';

@Component({
  selector: 'app-wheel-col',
  standalone: true,
  styles: [`
    .wheel-wrap {
      position: relative;
      height: 230px;
      overflow: hidden;
    }
    .wheel-scroll {
      height: 100%;
      overflow-y: scroll;
      scroll-snap-type: y mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .wheel-scroll::-webkit-scrollbar { display: none; }
    .wheel-fade-top, .wheel-fade-bottom {
      position: absolute; left: 0; right: 0; height: 92px;
      pointer-events: none; z-index: 2;
    }
    .wheel-fade-top    { top: 0;    background: linear-gradient(to bottom, #fbf6ec 60%, transparent); }
    .wheel-fade-bottom { bottom: 0; background: linear-gradient(to top,    #fbf6ec 60%, transparent); }
  `],
  template: `
    <div class="wheel-wrap">
      <div class="wheel-fade-top"></div>
      <div class="wheel-fade-bottom"></div>
      <div class="wheel-scroll" #scroll (scroll)="onScroll()">
        <div style="height:92px"></div>
        @for (item of items(); track $index; let i = $index) {
          <div
            class="flex items-center justify-center cursor-pointer select-none transition-all duration-75"
            style="height:46px; scroll-snap-align:center;"
            [style.font-size.px]="fontSize(i)"
            [style.font-weight]="i === sel ? 700 : 400"
            [style.color]="itemColor(i)"
            (click)="scrollTo(i, true)">
            {{ item }}
          </div>
        }
        <div style="height:92px"></div>
      </div>
    </div>
  `,
})
export class WheelColComponent implements AfterViewInit, OnChanges {
  items = input.required<string[]>();
  value = model.required<string>();

  scrollEl = viewChild.required<ElementRef<HTMLDivElement>>('scroll');

  sel = 0;

  ngAfterViewInit() {
    setTimeout(() => this.scrollTo(this.indexOfValue(), false));
  }

  ngOnChanges() {
    // When value changes programmatically, sync scroll
    const idx = this.indexOfValue();
    if (idx !== this.sel) setTimeout(() => this.scrollTo(idx, false));
  }

  onScroll() {
    const el = this.scrollEl().nativeElement;
    const idx = Math.max(0, Math.min(Math.round(el.scrollTop / 46), this.items().length - 1));
    this.sel = idx;
    this.value.set(this.items()[idx]);
  }

  scrollTo(idx: number, smooth: boolean) {
    const el = this.scrollEl().nativeElement;
    if (smooth) {
      el.scrollTo({ top: idx * 46, behavior: 'smooth' });
    } else {
      el.scrollTop = idx * 46;
    }
    this.sel = idx;
  }

  fontSize(i: number): number {
    const d = Math.abs(i - this.sel);
    return d === 0 ? 24 : d === 1 ? 20 : 18;
  }

  itemColor(i: number): string {
    const d = Math.abs(i - this.sel);
    return d === 0 ? '#211C16' : d === 1 ? '#A79C8A' : '#D0C6B2';
  }

  private indexOfValue(): number {
    const idx = this.items().indexOf(this.value());
    return idx >= 0 ? idx : 0;
  }
}
