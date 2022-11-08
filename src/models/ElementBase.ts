
type FillStyle = 'solid' | 'wip'
type StrokeStyle = 'solid' | 'dashed' | 'dotted'
type StrokeEndian = 'round' | 'sharp'

export type Elements = {
  // TODO: implement all these elements
  types: ['text', 'freedraw', 'shape', 'image'][number]
}

type _ElementBase = {
  id: string
  x: number
  y: number
  strokeColor: string
  backgroundColor: string
  fillStyle: FillStyle
  strokeWidth: number
  strokeStyle: StrokeStyle
  strokeEndian: StrokeEndian
  roughness: number
  opacity: number
  width: number
  height: number
  angle: number
  seed: number
  sequenceId: number
  sequenceNonce: number
  removed: boolean
  // TODO: group, element bonds, 
  lastUpdate: number
  link: string | null
  locked: boolean
  customData?: Record<string, any>
}

export type CommonElement = _ElementBase & {
  type: Elements['types']
}