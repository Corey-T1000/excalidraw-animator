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
  value: number | { x: number; y: number } | { strokeColor: string; strokeWidth: number; backgroundColor: string };
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  keyframes: Record<string, any>;
  isReverse: boolean;
  isLoop: boolean;
}