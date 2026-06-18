import { Injectable } from '@angular/core';
import { Rayon } from '../models';

export interface CatalogueProduct {
  id: string;
  name: string;
  rayon: Rayon;
}

const CATALOGUE: CatalogueProduct[] = [
  { id: 'c1',  name: 'Bananes',              rayon: 'fruits'   },
  { id: 'c2',  name: 'Pommes',               rayon: 'fruits'   },
  { id: 'c3',  name: 'Tomates',              rayon: 'fruits'   },
  { id: 'c4',  name: 'Tomates cerises',      rayon: 'fruits'   },
  { id: 'c5',  name: 'Carottes',             rayon: 'fruits'   },
  { id: 'c6',  name: 'Courgettes',           rayon: 'fruits'   },
  { id: 'c7',  name: 'Salade verte',         rayon: 'fruits'   },
  { id: 'c8',  name: 'Lait demi-écrémé',     rayon: 'frais'    },
  { id: 'c9',  name: 'Œufs ×6',             rayon: 'frais'    },
  { id: 'c10', name: 'Beurre',               rayon: 'frais'    },
  { id: 'c11', name: 'Yaourts nature',       rayon: 'frais'    },
  { id: 'c12', name: 'Crème fraîche',        rayon: 'frais'    },
  { id: 'c13', name: 'Fromage râpé',         rayon: 'frais'    },
  { id: 'c14', name: 'Jambon',               rayon: 'frais'    },
  { id: 'c15', name: 'Pain de mie',          rayon: 'epicerie' },
  { id: 'c16', name: 'Café moulu',           rayon: 'epicerie' },
  { id: 'c17', name: 'Pâtes',               rayon: 'epicerie' },
  { id: 'c18', name: 'Riz',                  rayon: 'epicerie' },
  { id: 'c19', name: 'Farine',               rayon: 'epicerie' },
  { id: 'c20', name: 'Huile d\'olive',       rayon: 'epicerie' },
  { id: 'c21', name: 'Concentré de tomate',  rayon: 'epicerie' },
  { id: 'c22', name: 'Sopalin',              rayon: 'inconnue' },
  { id: 'c23', name: 'Lessive',              rayon: 'inconnue' },
];

const RAYON_LABELS: Record<Rayon, string> = {
  fruits:   'Fruits & lég.',
  frais:    'Frais',
  epicerie: 'Épicerie',
  inconnue: 'Inconnue',
};

@Injectable({ providedIn: 'root' })
export class CatalogueService {
  readonly all = CATALOGUE;

  search(query: string): CatalogueProduct[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    return CATALOGUE
      .filter(p => p.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(q))
      .slice(0, 5);
  }

  rayonLabel(rayon: Rayon): string {
    return RAYON_LABELS[rayon];
  }

  // Returns {before, match, after} for bold highlight
  highlight(name: string, query: string): { before: string; match: string; after: string } {
    const idx = name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .indexOf(query.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''));
    if (idx < 0) return { before: name, match: '', after: '' };
    return {
      before: name.slice(0, idx),
      match:  name.slice(idx, idx + query.length),
      after:  name.slice(idx + query.length),
    };
  }
}
