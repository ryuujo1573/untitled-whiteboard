
export type Point = [number, number]
export type FillStyle = 'solid' | 'wip'
export type StrokeStyle = 'solid' | 'dashed' | 'dotted'
export type StrokeEndian = 'round' | 'sharp'

const Elements = [
  // TODO: implement all these elements
  'text', 'freedraw', 'shape', 'image'
] as const

export type AllTools = typeof Elements[number] | 'selector';

interface _ElementBase {
  readonly id: string
  x: number
  y: number
  removed: boolean // = false
  // TODO: group, element bonds, 
  lastUpdate: number
  strokeColor?: string
  backgroundColor?: string
  fillStyle?: FillStyle
  strokeWidth?: number
  strokeStyle?: StrokeStyle
  strokeEndian?: StrokeEndian
  // roughness?: number
  opacity: number // = 1
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
