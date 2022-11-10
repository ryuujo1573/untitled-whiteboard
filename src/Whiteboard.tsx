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

const elementCanvasCaches = new WeakMap<CommonElement, HTMLCanvasElement>()
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
      id: 'my-love',
      type: 'freedraw',
      x: 50,
      y: 50,
      strokeColor: DefaultElementStyle.strokeColor,
      backgroundColor: DefaultElementStyle.backgroundColor,
      fillStyle: DefaultElementStyle.fillStyle,
      strokeWidth: DefaultElementStyle.strokeWidth,
      strokeStyle: DefaultElementStyle.strokeStyle,
      opacity: DefaultElementStyle.opacity,
      points: [[
        0,
        0
      ],
      [
        -0.11328125,
        0
      ],
      [
        -0.51171875,
        -0.140625
      ],
      [
        -1.4140625,
        -0.7421875
      ],
      [
        -2.7890625,
        -1.50390625
      ],
      [
        -4.51171875,
        -2.44921875
      ],
      [
        -6.5,
        -3.9140625
      ],
      [
        -9.21484375,
        -5.75390625
      ],
      [
        -12.5546875,
        -7.64453125
      ],
      [
        -16.10546875,
        -9.28515625
      ],
      [
        -19.8984375,
        -10.63671875
      ],
      [
        -23.96484375,
        -11.97265625
      ],
      [
        -28.234375,
        -13.06640625
      ],
      [
        -32.26171875,
        -13.59765625
      ],
      [
        -36.328125,
        -13.78515625
      ],
      [
        -41.48046875,
        -13.78515625
      ],
      [
        -46.97265625,
        -13.78515625
      ],
      [
        -52.0859375,
        -13.78515625
      ],
      [
        -57.4296875,
        -13.7109375
      ],
      [
        -62.6953125,
        -12.9609375
      ],
      [
        -67.65625,
        -11.2890625
      ],
      [
        -72.08984375,
        -9.453125
      ],
      [
        -75.9921875,
        -7.6796875
      ],
      [
        -79.375,
        -5.9375
      ],
      [
        -82.171875,
        -4.453125
      ],
      [
        -84.40625,
        -3.14453125
      ],
      [
        -85.95703125,
        -1.921875
      ],
      [
        -86.984375,
        -0.7578125
      ],
      [
        -87.6875,
        0.23046875
      ],
      [
        -88.15625,
        1.07421875
      ],
      [
        -88.43359375,
        1.828125
      ],
      [
        -88.56640625,
        2.51171875
      ],
      [
        -88.6171875,
        3.1875
      ],
      [
        -88.6171875,
        3.765625
      ],
      [
        -88.6171875,
        4.4453125
      ],
      [
        -88.6171875,
        5.1171875
      ],
      [
        -88.6171875,
        5.75
      ],
      [
        -88.6171875,
        6.58203125
      ],
      [
        -88.6171875,
        7.58203125
      ],
      [
        -88.6171875,
        9.03125
      ],
      [
        -88.6171875,
        11.28515625
      ],
      [
        -88.6171875,
        14.2109375
      ],
      [
        -88.6171875,
        17.4453125
      ],
      [
        -88.6171875,
        20.94140625
      ],
      [
        -88.6171875,
        24.18359375
      ],
      [
        -88.453125,
        26.96484375
      ],
      [
        -88.1328125,
        29.5
      ],
      [
        -87.8125,
        31.7890625
      ],
      [
        -87.3203125,
        33.9140625
      ],
      [
        -86.6796875,
        35.84765625
      ],
      [
        -86.046875,
        37.76953125
      ],
      [
        -85.22265625,
        39.91015625
      ],
      [
        -84.05859375,
        42.2421875
      ],
      [
        -82.703125,
        44.8203125
      ],
      [
        -81.296875,
        47.8203125
      ],
      [
        -79.84765625,
        50.80078125
      ],
      [
        -78.296875,
        53.3828125
      ],
      [
        -76.79296875,
        55.90625
      ],
      [
        -75.47265625,
        58.19140625
      ],
      [
        -74.203125,
        60.09765625
      ],
      [
        -72.875,
        62.015625
      ],
      [
        -71.37109375,
        63.8984375
      ],
      [
        -69.55078125,
        65.71875
      ],
      [
        -67.5234375,
        67.58203125
      ],
      [
        -65.1875,
        69.5078125
      ],
      [
        -62.4375,
        71.375
      ],
      [
        -59.54296875,
        73.30078125
      ],
      [
        -56.7421875,
        75.2109375
      ],
      [
        -54.07421875,
        76.9921875
      ],
      [
        -51.3203125,
        78.78125
      ],
      [
        -48.8125,
        80.43359375
      ],
      [
        -46.640625,
        81.9296875
      ],
      [
        -44.51171875,
        83.31640625
      ],
      [
        -42.52734375,
        84.49609375
      ],
      [
        -40.41015625,
        85.5390625
      ],
      [
        -38.16015625,
        86.5234375
      ],
      [
        -35.90234375,
        87.44921875
      ],
      [
        -33.578125,
        88.27734375
      ],
      [
        -31.19921875,
        89.10546875
      ],
      [
        -28.63671875,
        89.94140625
      ],
      [
        -25.94140625,
        90.80078125
      ],
      [
        -23.390625,
        91.63671875
      ],
      [
        -21.23046875,
        92.328125
      ],
      [
        -19.49609375,
        92.953125
      ],
      [
        -18.1328125,
        93.5390625
      ],
      [
        -17.09765625,
        94.10546875
      ],
      [
        -16.38671875,
        94.40234375
      ],
      [
        -15.84765625,
        94.546875
      ],
      [
        -15.328125,
        94.796875
      ],
      [
        -14.65625,
        95.0625
      ],
      [
        -13.98046875,
        95.3359375
      ],
      [
        -13.13671875,
        95.61328125
      ],
      [
        -11.98046875,
        96.05078125
      ],
      [
        -10.6484375,
        96.63671875
      ],
      [
        -9.3203125,
        97.22265625
      ],
      [
        -8.17578125,
        97.80078125
      ],
      [
        -7.16796875,
        98.3671875
      ],
      [
        -6.328125,
        98.9453125
      ],
      [
        -5.5078125,
        99.64453125
      ],
      [
        -4.79296875,
        100.30859375
      ],
      [
        -4.0625,
        101.0390625
      ],
      [
        -3.08203125,
        101.94140625
      ],
      [
        -2.02734375,
        102.95703125
      ],
      [
        -0.80078125,
        104.1328125
      ],
      [
        0.48828125,
        105.26171875
      ],
      [
        1.59375,
        106.26953125
      ],
      [
        2.54296875,
        107.12109375
      ],
      [
        3.22265625,
        107.75390625
      ],
      [
        3.73828125,
        108.26953125
      ],
      [
        4.26171875,
        108.609375
      ],
      [
        4.59765625,
        108.6875
      ],
      [
        4.671875,
        108.5703125
      ],
      [
        4.671875,
        108.33984375
      ],
      [
        4.7578125,
        108.13671875
      ],
      [
        4.94140625,
        107.75390625
      ],
      [
        5.33203125,
        106.875
      ],
      [
        6.0625,
        104.765625
      ],
      [
        7.6640625,
        101.01171875
      ],
      [
        10.83984375,
        95.59765625
      ],
      [
        15.05859375,
        89.53125
      ],
      [
        19.828125,
        83.390625
      ],
      [
        24.3359375,
        77.34375
      ],
      [
        28.0546875,
        71.8359375
      ],
      [
        31.76171875,
        66.3125
      ],
      [
        35.23828125,
        61.140625
      ],
      [
        37.9921875,
        56.78515625
      ],
      [
        40.3203125,
        52.9453125
      ],
      [
        42.39453125,
        49.57421875
      ],
      [
        44.2421875,
        46.65234375
      ],
      [
        45.82421875,
        43.8515625
      ],
      [
        47.18359375,
        41.26171875
      ],
      [
        48.734375,
        38.4375
      ],
      [
        50.3671875,
        35.21875
      ],
      [
        52.0234375,
        31.9609375
      ],
      [
        53.86328125,
        28.4453125
      ],
      [
        55.7109375,
        24.91015625
      ],
      [
        57.375,
        21.390625
      ],
      [
        58.67578125,
        17.9140625
      ],
      [
        59.76953125,
        14.65234375
      ],
      [
        60.671875,
        11.40625
      ],
      [
        61.3515625,
        8.6015625
      ],
      [
        61.671875,
        6.28515625
      ],
      [
        61.671875,
        4.20703125
      ],
      [
        61.671875,
        2.30078125
      ],
      [
        61.671875,
        0.33984375
      ],
      [
        61.63671875,
        -1.8203125
      ],
      [
        61.11328125,
        -4.1484375
      ],
      [
        60.296875,
        -6.4375
      ],
      [
        59.6640625,
        -8.32421875
      ],
      [
        59.0546875,
        -9.86328125
      ],
      [
        58.453125,
        -11.29296875
      ],
      [
        57.88671875,
        -12.37109375
      ],
      [
        57.1953125,
        -13.20703125
      ],
      [
        56.3046875,
        -14.046875
      ],
      [
        55.25390625,
        -14.90234375
      ],
      [
        54.0234375,
        -15.7734375
      ],
      [
        52.421875,
        -16.6875
      ],
      [
        50.51953125,
        -17.48046875
      ],
      [
        48.41015625,
        -18.296875
      ],
      [
        46.296875,
        -18.9609375
      ],
      [
        44.37890625,
        -19.4453125
      ],
      [
        42.48046875,
        -19.99609375
      ],
      [
        40.58984375,
        -20.3828125
      ],
      [
        38.68359375,
        -20.6328125
      ],
      [
        36.6484375,
        -20.79296875
      ],
      [
        34.52734375,
        -20.859375
      ],
      [
        32.3984375,
        -20.859375
      ],
      [
        30.2890625,
        -20.859375
      ],
      [
        28.109375,
        -20.859375
      ],
      [
        25.62890625,
        -20.859375
      ],
      [
        23.29296875,
        -20.5859375
      ],
      [
        21.10546875,
        -20.15234375
      ],
      [
        19.14453125,
        -19.69140625
      ],
      [
        17.4296875,
        -19.07421875
      ],
      [
        15.73828125,
        -18.3125
      ],
      [
        14.203125,
        -17.28515625
      ],
      [
        12.83203125,
        -16.12109375
      ],
      [
        11.484375,
        -14.94140625
      ],
      [
        10.09765625,
        -13.4140625
      ],
      [
        8.83984375,
        -11.70703125
      ],
      [
        7.58984375,
        -9.98046875
      ],
      [
        6.375,
        -8.44921875
      ],
      [
        5.3515625,
        -7.10546875
      ],
      [
        4.6171875,
        -5.7421875
      ],
      [
        4.046875,
        -4.5703125
      ],
      [
        3.61328125,
        -3.58984375
      ],
      [
        3.33984375,
        -2.9140625
      ],
      [
        3.09375,
        -2.40234375
      ],
      [
        2.9609375,
        -2.0390625
      ],
      [
        2.9609375,
        -1.84375
      ],
      [
        2.88671875,
        -1.7265625
      ],
      [
        2.75,
        -1.5625
      ],
      [
        2.578125,
        -1.40625
      ],
      [
        2.390625,
        -1.27734375
      ],
      [
        2.25,
        -1.03515625
      ],
      [
        2.0625,
        -0.765625
      ],
      [
        1.83203125,
        -0.51953125
      ],
      [
        1.6796875,
        -0.25
      ],
      [
        1.55078125,
        0.0625
      ],
      [
        1.3828125,
        0.34765625
      ],
      [
        1.2578125,
        0.5078125
      ],
      [
        0,
        0
      ]],
      pressures: undefined,
      last: null,
    },
    {
      id: 'not-a-sine-wave',
      type: 'freedraw',
      x: 400,
      y: 50,
      strokeColor: DefaultElementStyle.strokeColor,
      backgroundColor: DefaultElementStyle.backgroundColor,
      fillStyle: DefaultElementStyle.fillStyle,
      strokeWidth: DefaultElementStyle.strokeWidth,
      strokeStyle: DefaultElementStyle.strokeStyle,
      opacity: DefaultElementStyle.opacity,
      points: [
        [
          0,
          0
        ],
        [
          0.12109375,
          0
        ],
        [
          0.2421875,
          0.25390625
        ],
        [
          0.2421875,
          3.06640625
        ],
        [
          0.2421875,
          9.46484375
        ],
        [
          0.2421875,
          17.640625
        ],
        [
          0.2421875,
          26.80078125
        ],
        [
          0.2421875,
          36.25
        ],
        [
          0.2421875,
          45.13671875
        ],
        [
          0.2421875,
          53.06640625
        ],
        [
          0.4609375,
          59.9296875
        ],
        [
          1.90625,
          65.71484375
        ],
        [
          4.9375,
          70.41796875
        ],
        [
          8.83984375,
          74.16015625
        ],
        [
          12.91796875,
          76.64453125
        ],
        [
          17.015625,
          78.453125
        ],
        [
          21.27734375,
          79.71875
        ],
        [
          25.421875,
          80.13671875
        ],
        [
          29.17578125,
          80.1484375
        ],
        [
          32.921875,
          78.515625
        ],
        [
          36.4375,
          74.6875
        ],
        [
          39.671875,
          68.83984375
        ],
        [
          43.21484375,
          60.4609375
        ],
        [
          46.8125,
          50.05859375
        ],
        [
          50.52734375,
          38.16796875
        ],
        [
          54.38671875,
          25.8046875
        ],
        [
          58.6484375,
          13.99609375
        ],
        [
          63.19140625,
          3.9765625
        ],
        [
          67.51171875,
          -3.4921875
        ],
        [
          72.08984375,
          -9.7265625
        ],
        [
          76.5625,
          -14.9921875
        ],
        [
          80.58203125,
          -18.87109375
        ],
        [
          84.265625,
          -21.51953125
        ],
        [
          87.59765625,
          -23.2578125
        ],
        [
          91.453125,
          -24.24609375
        ],
        [
          95.52734375,
          -24.5078125
        ],
        [
          99.98046875,
          -24.5078125
        ],
        [
          104.6640625,
          -24.3203125
        ],
        [
          108.46484375,
          -23.01171875
        ],
        [
          112.265625,
          -19.8125
        ],
        [
          115.875,
          -14.91015625
        ],
        [
          119.1171875,
          -7.3125
        ],
        [
          122.51171875,
          3.8671875
        ],
        [
          125.6171875,
          17.6796875
        ],
        [
          127.8984375,
          32.26171875
        ],
        [
          129.296875,
          46.015625
        ],
        [
          130.02734375,
          56.4375
        ],
        [
          130.02734375,
          56.4375
        ]
      ],
      pressures: undefined,
      last: null,
    },
  ])
  const [wipElement, setWipElement] = useState<CommonElement | null>(null)

  const [gridDisplay, setGridDisplay] = useState(true)

  // useEffect($, [elements])
  // const renderBoard = 

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }
    const canvas = canvasRef.current!
    const context = canvas.getContext('2d')!
    context.clearRect(0, 0, canvas.width, canvas.height)

    context.setTransform(1, 0, 0, 1, 0, 0)
    context.save()
    // context.scale(scale, scale)

    context.filter =
      document.documentElement.classList.contains('dark')
        ? "invert(93%) hue-rotate(180deg)"
        : "hue-rotate(0deg)"

    const gridSize = 20 // in css pixels

    // draw grid lines
    // TODO: elevate `gridSize`.
    if (gridDisplay) {
      const width = canvas.width
      const height = canvas.height
      context.save()
      context.lineWidth = 1
      context.strokeStyle = "rgba(0,0,0,0.1)"
      context.beginPath()

      for (let x = 0; x < width + gridSize; x += gridSize) {
        context.moveTo(x, -gridSize)
        context.lineTo(x, height + gridSize * 2)
      }
      for (let y = 0; y < height + gridSize; y += gridSize) {
        context.moveTo(-gridSize, y)
        context.lineTo(width + gridSize * 2, y)
      }
      context.stroke()
      context.restore()

      // FIXME: remove this.
      context.lineWidth = 10
      context.beginPath()
      context.moveTo(0, 0)
      context.lineTo(+width, 0)
      context.strokeStyle = 'red'
      context.stroke()

      context.beginPath()
      context.moveTo(0, 0)
      context.lineTo(0, +height)
      context.strokeStyle = 'blue'
      context.stroke()
    }

    elements.forEach(element => {
      // render element
      try {
        console.log(`🪝 hook: rendering ${element.id}`);

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
    (pointerState: PointerState) =>
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
        elementCanvasCaches.set(freedraw, generateCanvas(freedraw))
        setElements([...elements])
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
        console.log(dx, dy, ...points[0]);

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

  const [pos, setPos] = useState(['0', '0'])
  const onPointerMove = ({ clientX, clientY, pointerId, pressure, tangentialPressure, tiltX, tiltY, twist, width, height, pointerType, isPrimary }: React.PointerEvent<HTMLCanvasElement>) => {
    setPos([clientX.toFixed(4), clientY.toFixed(4)])
  }
  //#endregion
  // TODO: 宽高和 100% 有差距，需调整
  return (
    <div className="App">
      <span style={{
        position: 'absolute',
        margin: '2ch',
      }}>({(pos[0] + ',').padEnd(12) + (pos[0]).padEnd(9)})</span>
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

function getRelativeCoords(ele: FreedrawElement): [number, number, number, number] {
  return ele.points.reduce(([x1, y1, x2, y2], [x, y]) => [
    Math.min(x1, x),
    Math.min(y1, y),
    Math.max(x2, x),
    Math.max(y2, y)
  ], [Infinity, Infinity, -Infinity, -Infinity])
}

function getAbsoluteCoords(ele: FreedrawElement): [...Point, ...Point] {
  const [xmin, ymin, xmax, ymax] = getRelativeCoords(ele)
  return [
    xmin + ele.x,
    ymin + ele.y,
    xmax + ele.x,
    ymax + ele.y]
}

function generateCanvas(ele: FreedrawElement) {
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

  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min
  ctx.fillStyle = `rgba(${[rand(0, 255), rand(0, 255), rand(0, 255)].join(',')}, 0.2)`
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  console.log(`🏞️ image: ${ele.id}, pmin(${[x1, y1]}) pmax(${[x2, y2]}), ${[canvas.width, canvas.height]}`);


  const dx = x > x1 ? d(x, x1) * devicePixelRatio * 1 + 0.0 : 0
  const dy = y > y1 ? d(y, y1) * devicePixelRatio * 1 + 0.0 : 0
  ctx.translate(
    dx,
    dy)
  console.log(`🏞️ image: ${ele.id}, translate (${dx}, ${dy}).`)

  ctx.save() // why?
  // ctx.scale(devicePixelRatio * 1.0, devicePixelRatio * 1.0)

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

  ctx.fillStyle = 'rgb(0, 0, 0, .6)'
  ctx.fill(path)
  ctx.restore()

  //#endregion

  console.log('🏞️ image: fill path.', canvas);

  return canvas
}

function renderElement(element: CommonElement, context: CanvasRenderingContext2D) {
  switch (element.type) {
    case 'freedraw':
      const freedraw = element as FreedrawElement
      const oldCache = elementCanvasCaches.get(freedraw)

      if (!oldCache) {
        const newCache = (generateCanvas)(freedraw)
        elementCanvasCaches.set(freedraw, newCache)
      }
      const canvas = oldCache ?? elementCanvasCaches.get(freedraw)!

      // prevent shuffle in subpixel level
      const [x1, y1, x2, y2] = getAbsoluteCoords(freedraw)
        .map((v, i) => i % 2 == 1 ? Math.ceil(v) : Math.floor(v))

      const cx = ((x1 + x2) / 2)
      const cy = ((y1 + y2) / 2)

      // TODO: support scale & rotate

      context.save()
      // context.translate(cx * 1.0, cy * 1.0)

      console.log(`🪄 canvas: drawImage from (${(-(x2 - x1) / 2) * devicePixelRatio}, ${(-(y2 - y1) / 2) * devicePixelRatio}), with size of (${canvas.width}, ${canvas.height}).`);

      const x = ((x2 - x1) / 2) * devicePixelRatio
      const y = ((y2 - y1) / 2) * devicePixelRatio

      const fontSize = 16
      context.font = `${fontSize}px system-ui`
      context.lineWidth = 1
      context.fillText(freedraw.id, x, y + fontSize)
      context.drawImage(
        canvas,
        x, y
        // canvas.width, canvas.height
      )
      const ctx = canvas.getContext('2d')
      // debug
      if (ctx) {
        ctx.beginPath()
        ctx.ellipse(...freedraw.points[0], 8, 8, 0, 0, 2 * Math.PI)
        ctx.closePath()
        // ctx.fillStyle = ele.strokeColor ?? DefaultElementStyle.strokeColor
        ctx.fillStyle = 'rgba(102, 204, 255, .8)'
        ctx.fill()

        ctx.beginPath()
        let [x, y] = freedraw.points.at(-1)!
        ctx.rect(x - 5, y - 5, 10, 10)
        ctx.closePath()
        ctx.fillStyle = 'rgba(255, 102, 102, .5)'
        ctx.fill()
      }
      context.restore()

      console.log('🪄 canvas: renderElement', canvas);

      break
    default:
      break
  }
}

export default App
