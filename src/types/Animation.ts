export interface MoveValue {
  x: number;
  y: number;
}

export interface StyleValue {
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
}

export interface Animation {
  type: 'move' | 'rotate' | 'scale' | 'style';
  duration: number;
  delay: number;
  value: { x: number; y: number } | number | { strokeColor: string; strokeWidth: number; backgroundColor: string };
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  keyframes: Record<string, number | string | StyleValue>;
  isReverse: boolean;
  isLoop: boolean;
}