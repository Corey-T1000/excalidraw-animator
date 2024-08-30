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
  value: number | { x: number; y: number } | StyleValue;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  keyframes: Record<number, number | string | StyleValue>;
  isReverse: boolean;
  isLoop: boolean;
}