import React, { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { Provider } from 'react-redux'
import rough from 'roughjs'
import { getStroke } from 'perfect-freehand'
import { Events } from './consts/Events'
import { AllTools, CommonElement, DefaultElementStyle, FreedrawElement, Point } from './models/Elements'
import { randomId } from './random'
import { createPointerState, PointerState } from './models/PointerState'
import { waitForRequestAnimationFrame } from './canvasHelper'
import { unstable_batchedUpdates } from 'react-dom'
// import { Drawable } from 'roughjs/bin/core'

type ElementWithCanvas = {
  element: FreedrawElement,
  canvas: HTMLCanvasElement,
}

const elementWithCanvasCaches = new WeakMap<CommonElement, ElementWithCanvas>()
const pathCaches = new WeakMap<FreedrawElement, Path2D>();

(window as any).pathCaches = pathCaches

let lastPointerUp: ((event: any) => void) | null = null;

function App() {

  // TODO: 把`setTool`传递给工具栏。
  const [tool, setTool] = useState<AllTools>('freedraw')

  // darkmode support, run once
  useEffect(() => {
    const inBrowser = typeof window !== 'undefined'
    const customSetting = inBrowser ? localStorage.getItem('theme') : 'light'
    const isSystemDarkmode =
      inBrowser && matchMedia('(prefers-color-scheme: dark)').matches

    if (!customSetting && isSystemDarkmode) {
      document.documentElement.classList.add('dark')
    } else if (customSetting) {
      document.documentElement.classList.add(customSetting)
    }
    return () => {

    }
  }, [])

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // canvas ref update
  //  for adding touch events listener to canvas.
  useEffect(() => {
    const onTapStart = (evt: TouchEvent) => {
      console.log('onTapStart: ' + Date.now() / 1000)
    }

    const onTapEnd = (evt: TouchEvent) => {
      console.log('onTapEnd: ' + Date.now() / 1000)
    }

    canvasRef.current?.addEventListener(Events.touchStart, onTapStart)
    canvasRef.current?.addEventListener(Events.touchEnd, onTapEnd)

    return () => {
      canvasRef.current?.removeEventListener(Events.touchStart, onTapStart)
      canvasRef.current?.removeEventListener(Events.touchEnd, onTapEnd)
    }
  }, [canvasRef.current])

  const [elements, setElements] = useState<FreedrawElement[]>([
    {
      id: randomId(),
      type: 'freedraw',
      x: 50,
      y: 50,
      strokeColor: DefaultElementStyle.strokeColor,
      backgroundColor: DefaultElementStyle.backgroundColor,
      fillStyle: DefaultElementStyle.fillStyle,
      strokeWidth: DefaultElementStyle.strokeWidth,
      strokeStyle: DefaultElementStyle.strokeStyle,
      opacity: DefaultElementStyle.opacity,
      points: [
        [
          334.13671875,
          260.49609375
        ],
        [
          334.63671875,
          257.49609375
        ],
        [
          337.90234375,
          249.85546875
        ],
        [
          345.6640625,
          237.640625
        ],
        [
          357.41796875,
          222.73828125
        ],
        [
          373.640625,
          206.703125
        ],
        [
          394.1328125,
          190.58203125
        ],
        [
          417.3671875,
          175.6328125
        ],
        [
          443.078125,
          161.85546875
        ],
        [
          470.359375,
          149.37109375
        ],
        [
          498.25390625,
          138.59375
        ],
        [
          521.6171875,
          130.45703125
        ],
        [
          540.171875,
          124.44140625
        ],
        [
          553.96875,
          120.37890625
        ],
        [
          562.87109375,
          117.96875
        ],
        [
          569.91796875,
          116.35546875
        ],
        [
          573.93359375,
          115.953125
        ],
        [
          576.0390625,
          115.953125
        ],
        [
          577.02734375,
          115.953125
        ],
        [
          577.39453125,
          115.99609375
        ],
        [
          577.5,
          116.13671875
        ],
        [
          577.5,
          116.69921875
        ],
        [
          577.5,
          116.69921875
        ]
      ],
      pressures: undefined,
      last: null,
    }
  ])
  const [wipElement, setWipElement] = useState<CommonElement | null>(null)

  const [gridDisplay, setGridDisplay] = useState(false)

  // useEffect($, [elements])
  // const renderBoard = 

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }
    const canvas = canvasRef.current!
    const context = canvas.getContext('2d')!
    // const rc = rough.canvas(canvas)

    const gridSize = 16 // in css pixels

    // draw grid lines
    // TODO: elevate `gridSize`.
    if (gridDisplay) {
      const width = canvas.width
      const height = canvas.height
      context.save()
      context.lineWidth = 1
      context.strokeStyle = "rgba(0,0,0,0.1)"
      context.beginPath()

      for (let x = 0; x < width + gridSize * 2; x += gridSize) {
        context.moveTo(x, -gridSize)
        context.lineTo(x, height + gridSize * 2)
      }
      for (let y = 0; y < height + gridSize * 2; y += gridSize) {
        context.moveTo(-gridSize, y)
        context.lineTo(width + gridSize * 2, y)
      }
      context.stroke()
      context.restore()
    }

    elements.forEach(element => {
      // render element
      try {
        console.log(`rendering ${element.id}`);

        renderElement(element, context)
      } catch (error: any) {
        console.error(error);
      }
    })

  }, [elements])

  //#region Canvas related function callbacks

  const withBatchedUpdates = <T extends (arg: any) => void>(callback: T) =>
    waitForRequestAnimationFrame<Parameters<T>>(
      (event) => unstable_batchedUpdates(callback, event))

  const createPointerStrokingHandler =
    ({ ...rest }: PointerState) =>
      withBatchedUpdates((event: PointerEvent) => {
        const { clientX, clientY } = event
        const target = event.target
        console.log(clientX, clientY)

        if (!(target instanceof HTMLElement)) return

        // TODO: 用不可变对象，引入 redux 管理

        // assuming element is freedraw (just for now)
        if (!wipElement) return
        const freedraw = wipElement as FreedrawElement
        const points = freedraw.points
        const dx = clientX - freedraw.x
        const dy = clientY - freedraw.y

        const lastPoint = points.length > 0 && points.at(-1)
        const shouldIgnore = lastPoint && lastPoint[0] === dx && lastPoint[1] === dy
        if (shouldIgnore) return

        const pressures = freedraw.pressures ? [...freedraw.pressures, event.pressure] as const : undefined

        freedraw.pressures = pressures
        freedraw.points = [...points, [dx, dy]]
      })

  const createPointerStrokedHandler =
    (state: PointerState) =>
      withBatchedUpdates((event: PointerEvent) => {
        // setWipElement(null)
        lastPointerUp = null

        let it = state.listeners.onPointerMove
        it && it.flush()

        removeEventListener(Events.pointerMove, state.listeners.onPointerMove!)
        removeEventListener(Events.pointerUp, state.listeners.onPointerUp!)

        // assuming element is freedraw (just for now)
        if (!wipElement) return
        const freedraw = wipElement as FreedrawElement

        const { clientX, clientY } = event
        const points = freedraw.points
        let dx = clientX - freedraw.x
        let dy = clientY - freedraw.y

        // prevent infinitely small dots. (maybe by single click ?)
        if (dx === points[0][0] && dy === points[0][1]) {
          dx += 0.001
          dy += 0.001
        }

        freedraw.points = [...points, [dx, dy]]
        freedraw.pressures = freedraw.pressures
          ? [...freedraw.pressures, event.pressure] as const
          : undefined
        freedraw.last = [dx, dy]

        setWipElement(null)
        console.log(elements);
      })

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    // selection in-canvas only
    const selection = getSelection();
    if (selection?.anchorNode) {
      selection.removeAllRanges()
    }

    const pointerState = createPointerState(event)

    switch (tool) {
      case 'freedraw':
        // handle freedraw element creation.

        // TODO: replace defaults with current state.
        const element: FreedrawElement = {
          id: randomId(),
          type: 'freedraw',
          x: event.clientX,
          y: event.clientY,
          strokeColor: DefaultElementStyle.strokeColor,
          backgroundColor: DefaultElementStyle.backgroundColor,
          fillStyle: DefaultElementStyle.fillStyle,
          strokeWidth: DefaultElementStyle.strokeWidth,
          strokeStyle: DefaultElementStyle.strokeStyle,
          opacity: DefaultElementStyle.opacity,
          points: [],
          pressures: undefined,
          last: null,
        }

        setElements([...elements, element])
        setWipElement(element)

        break;
    }

    const $onPointerMove = createPointerStrokingHandler(pointerState)
    const $onPointerUp = createPointerStrokedHandler(pointerState)


    lastPointerUp = $onPointerUp
    // add temperary listener for stroking once.
    addEventListener(Events.pointerMove, $onPointerMove)
    addEventListener(Events.pointerUp, $onPointerUp)

    // save the function refs so as to remove them finally.
    pointerState.listeners.onPointerMove = $onPointerMove
    pointerState.listeners.onPointerUp = $onPointerUp


  }

  const onPointerMove = ({ pointerId, pressure, tangentialPressure, tiltX, tiltY, twist, width, height, pointerType, isPrimary }: React.PointerEvent<HTMLCanvasElement>) => {

  }
  //#endregion
  // TODO: 宽高和 100% 有差距，需调整
  return (
    <div className="App">
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasRef}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
      >
        {/* TODO: i18n */}
        Online Whiteboard
      </canvas>
    </div>
  )
}

function getAbsoluteCoords(ele: FreedrawElement): [number, number, number, number] {
  return ele.points.reduce(([x1, y1, x2, y2], [x, y]) => [
    Math.min(x1, 1),
    Math.min(y1, y),
    Math.max(x2, x),
    Math.max(y2, y)
  ], [Infinity, Infinity, -Infinity, -Infinity])
}

function generateCanvas(ele: FreedrawElement): ElementWithCanvas {
  let canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  //#region Get points ranges.

  // TODO: no need for those elements with w|h.
  // in that case, x1 = x x2 = x + width and y vice versa.
  const [x1, y1, x2, y2] = getAbsoluteCoords(ele)
  //#endregion


  //#region Initialize canvas.
  const { x, y } = ele
  const d = (a: number, b: number) => Math.abs(a - b)

  // in preceding case, `d(x1, x2)` should be `width`.
  canvas.width = d(x1, x2) * devicePixelRatio * 1.0 + 0.0
  canvas.height = d(y1, y2) * devicePixelRatio * 1.0 + 0.0

  ctx.translate(
    x > x1 ? d(x, x1) * devicePixelRatio * 1 + 0.0 : 0,
    y > y1 ? d(y, y1) * devicePixelRatio * 1.0 + 0.0 : 0)

  ctx.save() // why?
  ctx.scale(devicePixelRatio * 1.0, devicePixelRatio * 1.0)

  ctx.globalAlpha = ele.opacity ?? DefaultElementStyle.opacity

  ctx.save()
  ctx.fillStyle = ele.strokeColor ?? 'black'
  //#endregion


  //#region Generate freedraw path from points.
  const pointsEx = ele.pressures !== undefined
    ? ele.points.map(([x, y], i) => [x, y, ele.pressures![i]])
    : ele.points as readonly number[][] as number[][]

  // get stroke by 'perfect-freehand'
  const points = getStroke(pointsEx, {
    simulatePressure: ele.pressures === undefined,
    size: (ele.strokeWidth ?? DefaultElementStyle.strokeWidth) * 4.25,
    thinning: 0.6,
    smoothing: 0.5,
    streamline: 0.5,
    easing: (t) => Math.sin((t * Math.PI) / 2), // https://easings.net/#easeOutSine
    last: !!ele.last, // LastCommittedPoint is added on pointerup
  })

  const TO_FIXED_PRECISION = /(\s?[A-Z]?,?-?[0-9]*\.[0-9]{0,2})(([0-9]|e|-)*)/g
  const med = (A: number[], B: number[]): number[] =>
    [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]

  // generate SVG path data string.
  const path = new Path2D(points
    .reduce(
      (acc, point, i, arr) => {
        if (i === points.length - 1) {
          acc.push(point, med(point, arr[0]), "L", arr[0], "Z")
        } else {
          acc.push(point, med(point, arr[i + 1]))
        }
        return acc
      },
      ["M", points[0], "Q"],
    )
    .join(" ")
    .replace(TO_FIXED_PRECISION, "$1"))

  pathCaches.set(ele, path)

  ctx.restore()
  //#endregion


  //#region Draw element on canvas.

  // TODO: implement scale for element
  ctx.save()
  ctx.fillStyle = ele.strokeColor ?? DefaultElementStyle.strokeColor

  ctx.fill(path)
  ctx.restore()

  //#endregion

  return {
    element: ele,
    canvas: canvas,
  }
}

function renderElement(element: CommonElement, context: CanvasRenderingContext2D) {
  switch (element.type) {
    case 'freedraw':
      const ele = element as FreedrawElement
      const oldCache = elementWithCanvasCaches.get(ele)

      if (!oldCache) {
        const newCache = (generateCanvas)(ele as FreedrawElement)
        elementWithCanvasCaches.set(ele, newCache)
      }
      const { canvas } = oldCache ?? elementWithCanvasCaches.get(ele)!

      // prevent shuffle in subpixel level
      const [x1, y1, x2, y2] = getAbsoluteCoords(ele)
        .map((v, i) => i % 2 == 1 ? Math.ceil(v) : Math.floor(v))

      const cx = ((x1 + x2) / 2)
      const cy = ((y1 + y2) / 2)

      // TODO: support scale & rotate

      context.save()
      context.translate(cx * 1.0, cy * 1.0)

      context.drawImage(
        canvas,
        (-(x2 - x1) / 2) * devicePixelRatio,
        (-(y2 - y1) / 2) * devicePixelRatio,
        canvas.width, canvas.height
      )
      context.restore()

      console.log('renderElement', canvas);

      break
    default:
      break
  }
}

export default App
