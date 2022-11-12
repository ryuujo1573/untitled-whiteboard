
import React, { useEffect, useRef, useState } from 'react';
import { Events } from '../consts/Events';
import { createPointerState, PointerState } from '../models/PointerState';
import { colorize, utils, withBatchedUpdates, withBatchedUpdatesThrottled } from '../utils';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { startFreedraw, updateFreedraw, stopFreedraw } from '../redux/features/canvasSlice';
import store from '../redux/store';
import { BoardState, CommonElement, DefaultElementStyle, FreedrawElement } from '../models/types';
import { elementCanvasCaches, generateCanvas, getAbsoluteCoords } from '../utils/canvas';

function Whiteboard() {
  // TODO: darkmode auto change and customizable.
  const boardState = useAppSelector(state => state.canvas);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const inBrowser = typeof window !== 'undefined';
    const customSetting = inBrowser ? localStorage.getItem('theme') : 'light';
    const isSystemDarkmode =
      inBrowser && mq.matches;
    if (!customSetting && isSystemDarkmode) {
      document.documentElement.classList.add('dark');
    } else if (customSetting) {
      document.documentElement.classList.add(customSetting);
    }
    const onModeChange = () => {
    }
    onModeChange();

    mq.addEventListener('change', onModeChange);
    return () => {
      mq.removeEventListener('change', onModeChange);
    }
  }, [])

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // canvas ref update
  //  for adding touch events listener to canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    const onTapStart = (evt: TouchEvent) => {
      utils.log('onTapStart: ' + Date.now() / 1000);
    }

    const onTapEnd = (evt: TouchEvent) => {
      utils.log('onTapEnd: ' + Date.now() / 1000);
    }
    if (canvas) {
      // dispatch(renderBoard(canvas));
      canvas.addEventListener(Events.touchStart, onTapStart);
      canvas.addEventListener(Events.touchEnd, onTapEnd);
      // ¿ where to unsubscribe ?
      // store.subscribe(() => renderBoard(boardState, canvas));
      renderBoard(boardState, canvas);
    }

    return () => {
      canvas?.removeEventListener(Events.touchStart, onTapStart);
      canvas?.removeEventListener(Events.touchEnd, onTapEnd);
    }
  }, [canvasRef.current, boardState]);

  //#region Canvas related function callbacks

  const createPointerStrokingHandler = () =>
    withBatchedUpdatesThrottled<PointerEvent>((event) => {
      const { clientX, clientY, target, pressure } = event;
      if (!(target instanceof HTMLElement)) return;

      dispatch(updateFreedraw({ clientX, clientY, pressure }));
    });


  const createPointerStrokedHandler =
    (pointerState: PointerState) =>
      withBatchedUpdates<PointerEvent>((event) => {
        // lastPointerUp = null;

        let it = pointerState.listeners.onPointerMove;
        it && it.flush();

        removeEventListener(Events.pointerMove, pointerState.listeners.onPointerMove!);
        removeEventListener(Events.pointerUp, pointerState.listeners.onPointerUp!);

        const { clientX, clientY, pressure } = event;
        dispatch(stopFreedraw({ clientX, clientY, pressure }));
      });

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    // selection in-canvas only
    const selection = getSelection();
    if (selection?.anchorNode) {
      selection.removeAllRanges();
    }

    const pointerState = createPointerState(event);

    switch (boardState.tool) {
      case 'freedraw':
        dispatch(startFreedraw(pointerState));

        const onMove = createPointerStrokingHandler();
        const onUp = createPointerStrokedHandler(pointerState);

        pointerState.listeners.onPointerMove = onMove;
        pointerState.listeners.onPointerUp = onUp;
        addEventListener(Events.pointerMove, onMove);
        addEventListener(Events.pointerUp, onUp);
        break;
    }
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
      />
    </div>
  )
}


function renderElement(element: CommonElement, context: CanvasRenderingContext2D, debug?: boolean) {
  switch (element.type) {
    case 'freedraw':
      const freedraw = element as FreedrawElement;
      const oldCache = elementCanvasCaches.get(freedraw);

      if (!oldCache) {
        const newCache = generateCanvas(freedraw);
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
      // const x = ((x2 - x1) / 2) * devicePixelRatio
      // const y = ((y2 - y1) / 2) * devicePixelRatio
      const { x, y } = freedraw;

      if (debug) {
        const fontSize = 16;
        context.font = `${fontSize}px system-ui`;
        context.lineWidth = 1;
        context.fillText(freedraw.id, x1, y1 + fontSize);

        context.fillStyle = 'rgba(' + colorize(freedraw.id) + ',.2)';
        context.fillRect(x1, y1, freedraw.width!, freedraw.height!);

        const ctx = elementCanvas.getContext('2d')!;
        // ctx.setTransform(1,0,0,1,0,0)
        ctx.beginPath();
        ctx.ellipse(...freedraw.points[0], 8, 8, 0, 0, 2 * Math.PI);
        ctx.closePath();
        // ctx.fillStyle = ele.strokeColor ?? DefaultElementStyle.strokeColor
        ctx.fillStyle = 'rgba(102, 204, 255, .8)';
        ctx.fill();

        ctx.beginPath();
        let [_x, _y] = freedraw.points.at(-1)!;
        ctx.rect(_x - 5, _y - 5, 10, 10);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 102, 102, .8)';
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


function renderBoard(state: BoardState, canvas: HTMLCanvasElement) {
  const { renderConfig, allElements } = state;
  console.log('bingo');

  if (!canvas) return;

  const context = canvas.getContext('2d')!;
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.save();
  // context.scale(scale, scale)

  context.filter =
    document.documentElement.classList.contains('dark')
      ? "invert(93%) hue-rotate(180deg)"
      : "hue-rotate(0deg)";

  // TODO: elevate `gridSize`.
  const gridSize = 20; // in css pixels

  const { gridDisplay, debug } = renderConfig;

  // draw grid lines

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
  }

  // render elements
  console.log(allElements);
  allElements.indices.forEach(i => {
    const element = allElements.elementById[i];
    try {
      utils.log(`🪝 hook: rendering %c'${element.id}'`, 'color: blue;');

      renderElement(element, context, debug);
    } catch (error: any) {
      console.error(error);
    }
  })
}

export default Whiteboard;
