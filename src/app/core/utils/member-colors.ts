export interface MemberColor { bg: string; text: string; }

export const MEMBER_COLORS: MemberColor[] = [
  { bg: '#E4F2E9', text: '#1A8F5C' }, // vert
  { bg: '#FBE3DC', text: '#E8573C' }, // coral
  { bg: '#E7EFF6', text: '#356E9E' }, // bleu
  { bg: '#F8EFDC', text: '#B07A1E' }, // orange
  { bg: '#EEE8F8', text: '#6B54C7' }, // violet
  { bg: '#E5F4F2', text: '#2A8F82' }, // teal
  { bg: '#FCE8F0', text: '#D4477A' }, // rose
  { bg: '#FBF4DC', text: '#9A7A10' }, // jaune
  { bg: '#E8EAF6', text: '#3F51B5' }, // indigo
  { bg: '#EAF0E8', text: '#4A7A3D' }, // sauge
];

export function memberColor(colorIndex: number): MemberColor {
  return MEMBER_COLORS[colorIndex % MEMBER_COLORS.length];
}
