
import React, { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { getStroke } from 'perfect-freehand';
import { Events } from '../consts/Events';
import { AllTools, CommonElement, DefaultElementStyle, FreedrawElement, Point } from '../models/Elements';
import { randomId } from '../random';
import { createPointerState, PointerState } from '../models/PointerState';
import testElements from '../testElements';
import { utils, withBatchedUpdates, withBatchedUpdatesThrottled } from '../utils';

type TranslatedCanvas = [canvas: HTMLCanvasElement, dx: number, dy: number]
const elementCanvasCaches = new WeakMap<CommonElement, TranslatedCanvas>();
const pathCaches = new WeakMap<FreedrawElement, Path2D>();
let lastPointerUp: ((event: any) => void) | null = null;

// debug purpose
Object.assign(window, {
  elementCanvasCaches,
  pathCaches,
  lastPointerUp,
});

function Whiteboard() {

  // darkmode support, run once
  useEffect(() => {
    const inBrowser = typeof window !== 'undefined';
    const customSetting = inBrowser ? localStorage.getItem('theme') : 'light';
    const isSystemDarkmode =
      inBrowser && matchMedia('(prefers-color-scheme: dark)').matches;

    if (!customSetting && isSystemDarkmode) {
      document.documentElement.classList.add('dark');
    } else if (customSetting) {
      document.documentElement.classList.add(customSetting);
    }
    return () => {

    }
  }, [])

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // canvas ref update
  //  for adding touch events listener to canvas.
  useEffect(() => {
    const onTapStart = (evt: TouchEvent) => {
      utils.log('onTapStart: ' + Date.now() / 1000);
    }

    const onTapEnd = (evt: TouchEvent) => {
      utils.log('onTapEnd: ' + Date.now() / 1000);
    }

    canvasRef.current?.addEventListener(Events.touchStart, onTapStart);
    canvasRef.current?.addEventListener(Events.touchEnd, onTapEnd);

    addEventListener(Events.resize, onWindowResize);

    return () => {
      canvasRef.current?.removeEventListener(Events.touchStart, onTapStart);
      canvasRef.current?.removeEventListener(Events.touchEnd, onTapEnd);
      removeEventListener(Events.resize, onWindowResize);
    }
  }, [canvasRef.current]);

  const [boardState, setBoardState] = useState<BoardState>({
    wipElement: null,
    elements: testElements ?? [],
    tool: 'freedraw',
  });

  const [renderConfig, setRenderConfig] = useState<RenderConfig>({
    gridDisplay: true,
    debug: true,
  });

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current!;

    renderBoard(canvas, boardState, renderConfig);

  }, [boardState]);

  //#region Canvas related function callbacks

  const onWindowResize = withBatchedUpdates(() => {
    // boardState.elements.forEach(shapeCaches.delete);
    setBoardState({ ...boardState });
  });

  const createPointerStrokingHandler =
    (pointerState: PointerState) =>
      withBatchedUpdatesThrottled<PointerEvent>((event) => {
        if (!utils.shouldSkipLogging) {
          utils.shouldSkipLogging = true;
        }
        const { clientX, clientY } = event;
        const target = event.target;
        const { wipElement } = boardState;

        if (!(target instanceof HTMLElement)) return;

        // TODO: 用不可变对象，引入 redux 管理

        // assuming element is freedraw (just for now)
        if (!wipElement) return;
        const freedraw = wipElement as FreedrawElement;
        const points = freedraw.points;
        const dx = clientX - freedraw.x;
        const dy = clientY - freedraw.y;

        const lastPoint = points.length > 0 && points.at(-1);
        const shouldIgnore = lastPoint && lastPoint[0] === dx && lastPoint[1] === dy;
        if (shouldIgnore) return;

        const pressures = !!freedraw.pressures ? [...freedraw.pressures, event.pressure] as const : undefined;

        freedraw.pressures = pressures;
        freedraw.points = [...points, [dx, dy]];

        elementCanvasCaches.set(freedraw, generateCanvas(freedraw));
        setBoardState({
          ...boardState,
        });
      });

  const createPointerStrokedHandler =
    (state: PointerState) =>
      withBatchedUpdates<PointerEvent>((event) => {
        // setWipElement(null)
        if (utils.shouldSkipLogging) {
          utils.shouldSkipLogging = false;
        }
        lastPointerUp = null;

        let it = state.listeners.onPointerMove;
        it && it.flush();

        removeEventListener(Events.pointerMove, state.listeners.onPointerMove!);
        removeEventListener(Events.pointerUp, state.listeners.onPointerUp!);

        const { wipElement } = boardState;
        if (!wipElement) return;
        // assuming element is freedraw (just for now)
        const freedraw = wipElement as FreedrawElement;

        const { clientX, clientY } = event;
        const points = freedraw.points;
        let dx = clientX - freedraw.x;
        let dy = clientY - freedraw.y;

        // prevent infinitely small dots. (maybe by single click ?)
        utils.log(dx, dy, ...points[0]);

        // stroke as dots
        if (dx === points[0][0] && dy === points[0][1]) {
          // console.warn('stroke extremely small, changing its size to a visible level.');
          dx += 0.001;
          dy += 0.001;
        }

        freedraw.points = [...points, [dx, dy]];
        freedraw.pressures = freedraw.pressures
          ? [...freedraw.pressures, event.pressure] as const
          : undefined;
        freedraw.last = [dx, dy];

        setBoardState({
          ...boardState,
          wipElement: null
        });
        utils.log(boardState);
      })

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    // selection in-canvas only
    const selection = getSelection();
    if (selection?.anchorNode) {
      selection.removeAllRanges();
    }

    const pointerState = createPointerState(event);

    switch (boardState.tool) {
      case 'freedraw':
        // handle freedraw element creation.

        // TODO: replace defaults with current state.
        const id = randomId();
        utils.log(`🆕 created freedraw element ${id} at (${event.clientX}, ${event.clientY})`);

        const element: FreedrawElement = {
          id,
          type: 'freedraw',
          x: event.clientX,
          y: event.clientY,
          // strokeColor: DefaultElementStyle.strokeColor,
          // backgroundColor: DefaultElementStyle.backgroundColor,
          // fillStyle: DefaultElementStyle.fillStyle,
          // strokeWidth: DefaultElementStyle.strokeWidth,
          // strokeStyle: DefaultElementStyle.strokeStyle,
          // opacity: DefaultElementStyle.opacity,
          points: [[0, 0]],
          pressures: undefined,
          last: null,
        };

        boardState.wipElement = element;
        boardState.elements = [...boardState.elements, element]
        setBoardState({
          ...boardState,
        });

        break;
    }

    const $onPointerMove = createPointerStrokingHandler(pointerState);
    const $onPointerUp = createPointerStrokedHandler(pointerState);


    lastPointerUp = $onPointerUp;
    // add temperary listener for stroking once.
    addEventListener(Events.pointerMove, $onPointerMove);
    addEventListener(Events.pointerUp, $onPointerUp);

    // save the function refs so as to remove them finally.
    pointerState.listeners.onPointerMove = $onPointerMove;
    pointerState.listeners.onPointerUp = $onPointerUp;
  }

  const [pos, setPos] = useState(['0', '0']);
  const onPointerMove = ({ clientX, clientY, pointerId, pressure, tangentialPressure, tiltX, tiltY, twist, width, height, pointerType, isPrimary }: React.PointerEvent<HTMLCanvasElement>) => {
    setPos([clientX.toFixed(4), clientY.toFixed(4)]);
  };
  //#endregion
  // TODO: 宽高和 100% 有差距，需调整
  return (
    <div className="App">
      <span style={{
        position: 'absolute',
        margin: '2ch',
      }}>({(pos[0] + ',').padEnd(12) + (pos[1]).padEnd(9)})</span>
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
    Math.max(y2, y),
  ], [Infinity, Infinity, -Infinity, -Infinity]);
}

function getAbsoluteCoords(ele: FreedrawElement): [...Point, ...Point] {
  const [xmin, ymin, xmax, ymax] = getRelativeCoords(ele);
  return [
    xmin + ele.x,
    ymin + ele.y,
    xmax + ele.x,
    ymax + ele.y,
  ];
}

function generateCanvas(freedraw: FreedrawElement): TranslatedCanvas {
  let canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  //#region Get points ranges.

  // TODO: no need for those elements with w|h.
  // in that case, x1 = x x2 = x + width and y vice versa.
  const [x1, y1, x2, y2] = getAbsoluteCoords(freedraw);
  //#endregion


  //#region Initialize canvas.
  const { x, y } = freedraw;
  const d = (a: number, b: number) => Math.abs(a - b);

  // in preceding case, `d(x1, x2)` should be `width`.
  const padding = (freedraw.strokeWidth ?? DefaultElementStyle.strokeWidth) * 12;
  canvas.width = d(x1, x2) * 1.0 + padding * 2;
  canvas.height = d(y1, y2) * 1.0 + padding * 2;

  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;
  ctx.fillStyle = `rgba(${[rand(0, 255), rand(0, 255), rand(0, 255)].join(',')}, 0.2)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  utils.log(`🏞️ image: ${freedraw.id}, pmin(${[x1, y1]}) pmax(${[x2, y2]}), ${[canvas.width, canvas.height]}`);

  const dOriginX = x > x1 ? d(x, x1) * 1.0 + 0.0 : 0;
  const dOriginY = y > y1 ? d(y, y1) * 1.0 + 0.0 : 0;
  ctx.translate(
    dOriginX + padding,
    dOriginY + padding);
  utils.log(`🏞️ image: ${freedraw.id}, translate (${dOriginX}, ${dOriginY}).`);

  ctx.save(); // why?
  // ctx.scale(devicePixelRatio * 1.0, devicePixelRatio * 1.0)

  ctx.globalAlpha = freedraw.opacity ?? DefaultElementStyle.opacity;

  ctx.save();
  ctx.fillStyle = freedraw.strokeColor ?? 'black';
  //#endregion


  //#region Generate freedraw path from points.
  const pointsEx = freedraw.pressures !== undefined
    ? freedraw.points.map(([x, y], i) => [x, y, freedraw.pressures![i]])
    : freedraw.points as readonly number[][] as number[][];

  // get stroke by 'perfect-freehand'
  const points = getStroke(pointsEx, {
    simulatePressure: freedraw.pressures === undefined,
    size: (freedraw.strokeWidth ?? DefaultElementStyle.strokeWidth) * 4.25,
    thinning: 0.6,
    smoothing: 0.5,
    streamline: 0.5,
    easing: (t) => Math.sin((t * Math.PI) / 2), // https://easings.net/#easeOutSine
    last: !!freedraw.last, // LastCommittedPoint is added on pointerup
  });

  const TO_FIXED_PRECISION = /(\s?[A-Z]?,?-?[0-9]*\.[0-9]{0,2})(([0-9]|e|-)*)/g;
  const med = (A: number[], B: number[]): number[] =>
    [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];

  // generate SVG path data string.
  const path = new Path2D(points
    .reduce(
      (acc, point, i, arr) => {
        if (i === points.length - 1) {
          acc.push(point, med(point, arr[0]), "L", arr[0], "Z");
        } else {
          acc.push(point, med(point, arr[i + 1]));
        }
        return acc;
      },
      ["M", points[0], "Q"],
    )
    .join(" ")
    .replace(TO_FIXED_PRECISION, "$1"));

  pathCaches.set(freedraw, path);

  ctx.restore();
  //#endregion


  //#region Draw element on canvas.

  // TODO: implement scale for element
  ctx.save();

  ctx.fillStyle = 'rgb(0, 0, 0, .6)';
  ctx.fill(path);
  ctx.restore();

  //#endregion

  utils.log('🏞️ image: fill path.', canvas);

  return [canvas, freedraw.x - x1, freedraw.y - y1];
}

function renderElement(element: CommonElement, context: CanvasRenderingContext2D, debug?: boolean) {
  switch (element.type) {
    case 'freedraw':
      const freedraw = element as FreedrawElement;
      const oldCache = elementCanvasCaches.get(freedraw);

      if (!oldCache) {
        const newCache = (generateCanvas)(freedraw);
        elementCanvasCaches.set(freedraw, newCache);
      }
      const [elementCanvas, offsetX, offsetY] = oldCache ?? elementCanvasCaches.get(freedraw)!;

      // prevent shuffle in subpixel level
      const [x1, y1, x2, y2] = getAbsoluteCoords(freedraw)
        .map((v, i) => i % 2 == 1 ? Math.ceil(v) : Math.floor(v));

      const cx = ((x1 + x2) / 2);
      const cy = ((y1 + y2) / 2);

      // TODO: support scale & rotate

      context.save();
      // context.translate(cx * 1.0, cy * 1.0)

      const { x, y } = freedraw;
      // const x = ((x2 - x1) / 2) * devicePixelRatio
      // const y = ((y2 - y1) / 2) * devicePixelRatio

      utils.log(`🪄 canvas: drawImage from (${x}, ${y}), with size of (${elementCanvas.width}, ${elementCanvas.height}).`);

      const fontSize = 16;
      context.font = `${fontSize}px system-ui`;
      context.lineWidth = 1;
      context.fillText(freedraw.id, x, y + fontSize);

      if (debug) {
        const ctx = elementCanvas.getContext('2d')!;
        // ctx.setTransform(1,0,0,1,0,0)
        ctx.beginPath();
        ctx.ellipse(...freedraw.points[0], 8, 8, 0, 0, 2 * Math.PI);
        ctx.closePath();
        // ctx.fillStyle = ele.strokeColor ?? DefaultElementStyle.strokeColor
        ctx.fillStyle = 'rgba(102, 204, 255, .8)';
        ctx.fill();

        ctx.beginPath();
        let [x, y] = freedraw.points.at(-1)!;
        ctx.rect(x - 5, y - 5, 10, 10);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 102, 102, .5)';
        ctx.fill();
      }
      context.drawImage(
        elementCanvas,
        x - offsetX, y - offsetY
        // canvas.width, canvas.height
      );
      context.restore();

      utils.log('🪄 canvas: renderElement', elementCanvas);

      break;
    default:
      break;
  }
}

type RenderConfig = {
  gridDisplay: boolean,
  debug?: boolean,
}

type BoardState = {
  wipElement: CommonElement | null,
  elements: CommonElement[],
  tool: AllTools,
}

function renderBoard(canvas: HTMLCanvasElement, { elements }: BoardState, renderConfig: RenderConfig) {
  const context = canvas.getContext('2d')!;
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.save();
  // context.scale(scale, scale)

  context.filter =
    document.documentElement.classList.contains('dark')
      ? "invert(93%) hue-rotate(180deg)"
      : "hue-rotate(0deg)";

  const gridSize = 20; // in css pixels

  const { gridDisplay, debug } = renderConfig;

  // draw grid lines
  // TODO: elevate `gridSize`.

  if (gridDisplay) {
    const width = canvas.width;
    const height = canvas.height;
    context.save();
    context.lineWidth = 1;
    context.strokeStyle = "rgba(0,0,0,0.1)";
    context.beginPath();

    for (let x = 0; x < width + gridSize; x += gridSize) {
      context.moveTo(x, -gridSize);
      context.lineTo(x, height + gridSize * 2);
    }
    for (let y = 0; y < height + gridSize; y += gridSize) {
      context.moveTo(-gridSize, y);
      context.lineTo(width + gridSize * 2, y);
    }
    context.stroke();
    context.restore();

    //#region Stroke both axes.

    context.lineWidth = 10;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(width, 0);
    context.strokeStyle = 'red';
    context.stroke();

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, height);
    context.strokeStyle = 'blue';
    context.stroke();
    //#endregion

  }

  elements.forEach(element => {
    // render element
    try {
      utils.log(`🪝 hook: rendering ${element.id}`);

      renderElement(element, context, debug);
    } catch (error: any) {
      console.error(error);
    }
  })

}

export default Whiteboard;
