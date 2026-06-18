import { Pipe, PipeTransform } from '@angular/core';

const DAYS   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

@Pipe({ name: 'frenchDate', pure: true, standalone: true })
export class FrenchDatePipe implements PipeTransform {
  transform(timestamp: number): string {
    const d = new Date(timestamp);
    return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  }
}
