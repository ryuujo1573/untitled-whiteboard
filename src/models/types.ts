import { Point } from "roughjs/bin/geometry";

export type FillStyle = 'solid' | 'wip'
export type StrokeStyle = 'solid' | 'dashed' | 'dotted'
export type StrokeEndian = 'round' | 'sharp'

const Elements = [
  // TODO: implement all these elements
  'text', 'freedraw', 'shape', 'image',
] as const

type ElementType = typeof Elements[number];


type ElementToolMap = {
  'text': ['text', 'vtext'],
  'freedraw': ['freedraw'],
  'shape': ['rect', 'circle'],
  'image': ['image'],
}

export type AllTools = (ElementToolMap[ElementType][number] | 'selector');

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
  strokeColor: "black",
  backgroundColor: "black",
  fillStyle: "solid",
  strokeWidth: 1,
  strokeStyle: "solid",
  strokeEndian: "round",
  opacity: 1,
}

type _ElementBase = {
  readonly id: string
  x: number
  y: number
  // TODO: group, element bonds, 
  lastUpdate?: number
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

type FreedrawProps = {
  points: Point[]
  pressures?: number[]
  last: Point | null
}

type ConcreteElement<P, T extends typeof Elements[number] = never> = _ElementBase & {
  readonly type: P extends any ? typeof Elements[number] : T
} & P;

// All element types here:
export type FreedrawElement = ConcreteElement<FreedrawProps, 'freedraw'>;
export type CommonElement = FreedrawElement
// export type ImageElement = ConcreteElement


export enum Themes {
  light = 'light',
  dark = 'dark',
  çao = '?',
  auto = 'auto',
}

export type Locales = 'zh_cn' | 'en'


type Id = string;

export type BoardState = {
  id: string,
  title: string,
  size: {
    width: number,
    height: number,
  },

  tool: AllTools,
  toolStyle: {},

  allElements: {
    indices: Id[],
    elementById: {
      [id: Id]: CommonElement,
    }
  },
  editingElement: CommonElement | null,

  renderConfig: {
    gridDisplay: boolean,
    debug?: boolean,
  },
}