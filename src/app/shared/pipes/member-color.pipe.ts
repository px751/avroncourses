import { Pipe, PipeTransform } from '@angular/core';
import { memberColor, MemberColor } from '../../core/utils/member-colors';

@Pipe({ name: 'memberColor', pure: true, standalone: true })
export class MemberColorPipe implements PipeTransform {
  transform(colorIndex: number): MemberColor {
    return memberColor(colorIndex);
  }
}
