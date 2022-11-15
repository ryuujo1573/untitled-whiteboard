import { nanoid } from "@reduxjs/toolkit";
import { Point } from "roughjs/bin/geometry";
import { ImageMimeTypes } from "../consts/constants";

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
export type ToolsInBar = Exclude<AllTools, 'vtext'>

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

interface ElementBase<S extends ElementType> {
  type: S,
  readonly id: string
  x: number
  y: number
  // TODO: group, element bonds, 
  selected?: boolean
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


// All element types here:
export type AnyElement = FreedrawElement | ImageElement

export interface FreedrawElement extends ElementBase<'freedraw'> {
  points: Point[]
  pressures?: number[]
  last: Point | null
}
export interface ImageElement extends ElementBase<'image'> {
  fileId: FileId | null,
}


export enum Themes {
  light = 'light',
  dark = 'dark',
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
      [id: Id]: AnyElement,
    }
  },
  editingElement: AnyElement | null,

  selected: string[],
  selection: [x1: number, y1: number, x2: number, y2: number] | null,

  renderConfig: {
    gridDisplay: boolean,
    debug?: boolean,
  },

}

export type DataURL = string 

export type FileId = ReturnType<typeof nanoid>

export type BinaryFileData = {
  mimeType: typeof ImageMimeTypes[number]
  id: FileId,
  dataURL: DataURL,
  // 创建时的日期
  createdDate: number,
}

export type BinaryFiles = Record<FileId, BinaryFileData>

export interface ImageCache {
  image: HTMLImageElement,
  mimeType: typeof ImageMimeTypes[number],
}