import React, { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { Provider } from 'react-redux'
import rough from 'roughjs'
import { getStroke } from 'perfect-freehand'
import { Events } from './consts/Events'
import { AllTools, CommonElement, DefaultElementStyle, FreedrawElement, Point } from './models/Elements'
import { randomId } from './random'
// import { Drawable } from 'roughjs/bin/core'

type ElementWithCanvas = {
  element: FreedrawElement,
  canvas: HTMLCanvasElement,
}

const elementWithCanvasCaches = new WeakMap<CommonElement, ElementWithCanvas>()
const pathCaches = new WeakMap<FreedrawElement, Path2D>()

function App() {

  // TODO: 把`setTool`传递给工具栏。
  const [tool, setTool] = useState<AllTools>('selector')

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

  const [elements, setElements] = useState<CommonElement[]>([])

  const [gridDisplay, setGridDisplay] = useState(false)

  // useEffect($, [elements])
  const renderBoard = () => {
    if (canvasRef.current) {
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
        renderElement(element, context)
      } catch (error: any) {
        console.error(error);
      }
    })

  }

  useEffect(renderBoard, [elements])

  //#region Canvas related function callbacks

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    // selection in-canvas only
    const selection = getSelection();
    if (selection?.anchorNode) {
      selection.removeAllRanges()
    }

    switch (tool) {
      case 'freedraw':
        // handle freedraw element creation.
        
        // TODO: replace defaults with current state.
        const element: FreedrawElement = {
          id: randomId(),
          type: 'freedraw',
          x: event.clientX,
          y: event.clientY,
          lastUpdate: 0,
          removed: false,
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
        break;
    }
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

  ctx.globalAlpha = ele.opacity

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
        if (i === ele.points.length - 1) {
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

      break
    default:
      break
  }
}

export default App
