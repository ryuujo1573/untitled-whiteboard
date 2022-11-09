
export type Point = [number, number]
export type FillStyle = 'solid' | 'wip'
export type StrokeStyle = 'solid' | 'dashed' | 'dotted'
export type StrokeEndian = 'round' | 'sharp'

const Elements = [
  // TODO: implement all these elements
  'text', 'freedraw', 'shape', 'image'
] as const

export type AllTools = typeof Elements[number] | 'selector';

type NullableKeys<T> = {
  [P in keyof T]-?: Extract<T[P], null | undefined> extends never ? never : P
}[keyof T]
type ExtractNullable<T> = {
  [P in NullableKeys<T>]: NonNullable<T[P]>
}
type ElementStyle = {
  strokeColor?: string
  backgroundColor?: string
  fillStyle?: FillStyle
  strokeWidth?: number
  strokeStyle?: StrokeStyle
  strokeEndian?: StrokeEndian
  opacity?: number
}
export const DefaultElementStyle: ExtractNullable<ElementStyle> = {
  strokeColor: "auto",
  backgroundColor: "auto",
  fillStyle: "solid",
  strokeWidth: 1,
  strokeStyle: "solid",
  strokeEndian: "round",
  opacity: 1,

}

interface _ElementBase {
  readonly id: string
  x: number
  y: number
  // TODO: group, element bonds, 
  lastUpdate: number
  removed?: boolean
  strokeColor?: string
  backgroundColor?: string
  fillStyle?: FillStyle
  strokeWidth?: number
  strokeStyle?: StrokeStyle
  strokeEndian?: StrokeEndian
  // roughness?: number
  opacity?: number
  width?: number
  height?: number
  angle?: number
  // seed?: number
  // sequenceId: number
  // sequenceNonce: number
  link?: string
  locked?: boolean
  /// Additional records
  data?: Record<string, any>
}

interface IFreedrawElement {
  readonly points: readonly Point[]
  readonly pressures?: readonly number[]
  last: Point | null
}

type ConcreteElement<P, T extends typeof Elements[number] = never> = _ElementBase & {
  readonly type: P extends any ? typeof Elements[number] : T
} & P;

// All element types here:
export type CommonElement = ConcreteElement<{}>
export type FreedrawElement = ConcreteElement<IFreedrawElement, 'freedraw'>;



// export type _FreedrawElement = ElementBase<'freedraw'> & Readonly<{
//   points: readonly Point[],
//   pressures: readonly number[],
//   // simulatePressure: boolean,
// }>

type _ElementBaseProps = Point & {
  id?: string
}
