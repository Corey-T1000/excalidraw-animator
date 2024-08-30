declare module 'lucide-react' {
  import { FC, SVGProps } from 'react'
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number
  }
  export type Icon = FC<IconProps>
  export const Square: Icon
  export const Diamond: Icon
  export const Circle: Icon
  export const ArrowRight: Icon
  export const Minus: Icon
  export const Pencil: Icon
  export const Type: Icon
  export const HelpCircle: Icon
  export const Download: Icon
  // Add the missing icons
  export const Move: Icon
  export const RotateCw: Icon
  export const Maximize: Icon
  export const Palette: Icon
  // Add other icons as needed
}