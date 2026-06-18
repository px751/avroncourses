import { Rayon } from '../models';

export interface RayonMeta {
  dot: string;
  text: string;
  label: string;
  bg: string;
  border: string;
}

export const RAYON_META: Record<Rayon, RayonMeta> = {
  fruits:   { dot: '#1A8F5C', text: '#137A4E', label: 'Fruits & légumes', bg: '#E4F2E9', border: '#B8DFCA' },
  frais:    { dot: '#3E7FB8', text: '#356E9E', label: 'Frais',             bg: '#E7EFF6', border: '#CFE0EE' },
  epicerie: { dot: '#E8A33D', text: '#B07A1E', label: 'Épicerie',          bg: '#F8EFDC', border: '#EDD9A3' },
  inconnue: { dot: '#A89C86', text: '#8E8270', label: 'Inconnue',          bg: '#EFEADC', border: '#DCD2BD' },
};

export function rayonMeta(r: Rayon): RayonMeta {
  return RAYON_META[r];
}
