import React, { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { Provider } from 'react-redux'
import rough from 'roughjs'
import { Events } from './consts/Events'
import { AllTools, CommonElement, FreedrawElement, Point } from './models/Elements'
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

  // useEffect($, [elements])
  const renderBoard = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const gridSize = 16 // in css pixels

    // draw grid lines
    // TODO: elevate `gridSize`.
    if (canvasRef.current && context) {
      const width = canvasRef.current.width
      const height = canvasRef.current.height
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


    elements.forEach(ele => {
      // render element
      switch (ele.type) {
        case 'freedraw':

          const oldCache = elementWithCanvasCaches.get(ele)

          if (!oldCache) {
            const newCache = (generateCanvas)(ele as FreedrawElement)
            elementWithCanvasCaches.set(ele, newCache)
          }
          const cache = oldCache ?? elementWithCanvasCaches.get(ele)!

          context?.drawImage(cache.canvas, 0, 0)
          break
        default:
          break
      }
    })

  }

  useEffect(renderBoard, [elements])

  const onPointerMove = ({ pointerId, pressure, tangentialPressure, tiltX, tiltY, twist, width, height, pointerType, isPrimary }: React.PointerEvent<HTMLCanvasElement>) => {

  }

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

function generateCanvas(ele: FreedrawElement): ElementWithCanvas {
  let canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  //#region get points ranges

  // TODO: no need for those elements with w|h.
  // in that case, x1 = x x2 = x + width and y vice versa.
  const [x1, y1, x2, y2] = ele.points.reduce(([x1, y1, x2, y2], [x, y]) => [
    Math.min(x1, 1),
    Math.min(y1, y),
    Math.max(x2, x),
    Math.max(y2, y)
  ], [Infinity, Infinity, -Infinity, -Infinity])
  //#endregion


  //#region draw on canvas
  const { x: dx, y: dy } = ele
  const d = (a: number, b: number) => Math.abs(a - b)

  // in preceding case, `d(x1, x2)` should be `width`.
  canvas.width = d(x1, x2) * devicePixelRatio * 1.0 + 0.0
  canvas.height = d(y1, y2) * devicePixelRatio * 1.0 + 0.0

  ctx.translate(
    ele.x > x1 ? d(ele.x, x1) * devicePixelRatio * 1 + 0.0 : 0,
    ele.y > y1 ? d(ele.y, y1) * devicePixelRatio * 1.0 + 0.0 : 0)

  ctx.save() // why?
  ctx.scale(devicePixelRatio * 1.0, devicePixelRatio * 1.0)

  const rc = rough.canvas(canvas)

  ctx.globalAlpha = ele.opacity

  ctx.save()
  ctx.fillStyle = ele.strokeColor ?? 'black'
  const TO_FIXED_PRECISION = /(\s?[A-Z]?,?-?[0-9]*\.[0-9]{0,2})(([0-9]|e|-)*)/g
  const med = (A: Point, B: Point): Point =>
    [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];

  ele.points
    .reduce(
      (acc, point, i, arr) => {
        if (i === ele.points.length - 1) {
          acc.push(point, med(point, arr[0]), "L", arr[0], "Z");
        } else {
          acc.push(point, med(point, arr[i + 1]));
        }
        return acc;
      },
      ["M", ele.points[0], "Q"],
    )
    .join(" ")
    .replace(TO_FIXED_PRECISION, "$1")
  ctx.restore()
  //#endregion
  
  return {
    element: ele,
    canvas: canvas,
  }
}

export default App
