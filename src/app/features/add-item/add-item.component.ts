import { Component, computed, inject, signal, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogueService, CatalogueProduct } from '../../core/services/catalogue.service';
import { ListService } from '../../core/services/list.service';
import { SessionService } from '../../core/services/session.service';
import { Rayon } from '../../core/models';

const RAYONS: { value: Rayon; label: string }[] = [
  { value: 'inconnue', label: 'Inconnue' },
  { value: 'frais',    label: 'Frais' },
  { value: 'fruits',   label: 'Fruits & lég.' },
  { value: 'epicerie', label: 'Épicerie' },
];

const RAYON_DOT: Record<Rayon, string> = {
  fruits:   '#1A8F5C',
  frais:    '#3E7FB8',
  epicerie: '#E8A33D',
  inconnue: '#A89C86',
};

const RAYON_BG: Record<Rayon, string> = {
  fruits:   '#E7F2EA',
  frais:    '#E7EFF6',
  epicerie: '#F8EFDC',
  inconnue: '#EFEADC',
};

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-item.component.html',
})
export class AddItemComponent implements AfterViewInit {
  private catalogue = inject(CatalogueService);
  private listService = inject(ListService);
  private session  = inject(SessionService);
  private router   = inject(Router);

  readonly rayons = RAYONS;

  inputRef = viewChild<ElementRef<HTMLInputElement>>('input');

  query           = signal('');
  selectedRayon   = signal<Rayon>('inconnue');

  suggestions = computed(() => this.catalogue.search(this.query()));
  showNewBlock = computed(() => this.query().trim().length > 0);

  ngAfterViewInit() {
    setTimeout(() => this.inputRef()?.nativeElement.focus());
  }

  highlight(name: string) {
    return this.catalogue.highlight(name, this.query());
  }

  dotColor(rayon: Rayon)  { return RAYON_DOT[rayon]; }
  bgColor(rayon: Rayon)   { return RAYON_BG[rayon]; }
  rayonLabel(rayon: Rayon){ return this.catalogue.rayonLabel(rayon); }

  selectSuggestion(product: CatalogueProduct) {
    const member = this.session.currentMember();
    if (!member) return;
    this.listService.add(product.name, product.rayon, member.id);
    this.resetAndRefocus();
  }

  addNewItem() {
    const name = this.query().trim();
    if (!name) return;
    const member = this.session.currentMember();
    if (!member) return;
    this.listService.add(name, this.selectedRayon(), member.id);
    this.resetAndRefocus();
  }

  private resetAndRefocus() {
    this.query.set('');
    this.selectedRayon.set('inconnue');
    setTimeout(() => this.inputRef()?.nativeElement.focus());
  }

  cancel() {
    this.router.navigate(['/list']);
  }
}
