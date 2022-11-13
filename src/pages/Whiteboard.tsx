import React, { useEffect, useRef, useState } from 'react';
import { Events } from '../consts/Events';
import { createPointerState, PointerState } from '../models/PointerState';
import { colorize, utils, withBatchedUpdates, withBatchedUpdatesThrottled } from '../utils';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { startSelection, updateSelection, stopSelection, addElement } from '../redux/features/canvasSlice';
import { BoardState, CommonElement, DefaultElementStyle, FreedrawElement, ImageElement } from '../models/types';
import { elementCanvasCaches, generateCanvas, generateImageCanvas, getAbsoluteCoords, getRelativeCoords } from '../utils/canvas';
import { ActionCreators } from 'redux-undo';
import OperationUI from '../components/OperationUI';
import { strokeStart, strokeUpdate } from '../redux/features/freedrawSlice';
import { strokeStop } from '../redux/features/actions';

let lastPointerUp: ((event: any) => void) | null = null;
let pointerState: PointerState | null = null;
let i = 0;
function Whiteboard() {
  const boardState = useAppSelector(state => state.canvas);
  const freedrawState = useAppSelector(state => state.freedraw);
  const dispatch = useAppDispatch();

  // TODO: darkmode auto change and customizable.
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
    // const onTapStart = (evt: TouchEvent) => {
    //   utils.log('onTapStart: ' + Date.now() / 1000);
    // }

    // const onTapEnd = (evt: TouchEvent) => {
    //   utils.log('onTapEnd: ' + Date.now() / 1000);
    // }
    if (canvas) {
      // canvas.addEventListener(Events.touchStart, onTapStart);
      // canvas.addEventListener(Events.touchEnd, onTapEnd);
      renderBoard(boardState, canvas);

      if (freedrawState.freedraw) {
        renderElement(freedrawState.freedraw, canvas.getContext('2d')!, false)
      }
    }


    return () => {
      // canvas?.removeEventListener(Events.touchStart, onTapStart);
      // canvas?.removeEventListener(Events.touchEnd, onTapEnd);
    }
  }, [canvasRef.current, boardState, freedrawState]);

  //#region Canvas related function callbacks

  const createHandler = (f: (evt: PointerEvent) => void) => withBatchedUpdates<PointerEvent>(f);
  const createThrottledHandler = (f: (evt: PointerEvent) => void) => withBatchedUpdatesThrottled<PointerEvent>(f);

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    // selection in-canvas only
    const selection = getSelection();
    if (selection?.anchorNode) {
      selection.removeAllRanges();
    }

    if (lastPointerUp !== null) {
      // clean up for possible missing `pointerup` after a `pointerdown`.
      lastPointerUp(event);
    }

    pointerState = createPointerState(event);

    switch (boardState.tool) {
      case 'selector': {
        dispatch(startSelection({ clientX: event.clientX, clientY: event.clientY }));

        const onMove = createThrottledHandler(evt => {
          const { clientX, clientY, pressure } = evt;
          dispatch(updateSelection({ clientX, clientY, pressure }));
        });
        const onUp = createHandler(evt => {
          lastPointerUp = null;
          if (!pointerState) return;
          let it = pointerState.listeners.onPointerMove;
          it && it.flush();
          removeEventListener(Events.pointerMove, pointerState.listeners.onPointerMove!);
          removeEventListener(Events.pointerUp, pointerState.listeners.onPointerUp!);

          const { clientX, clientY, pressure } = evt;

          dispatch(stopSelection({ clientX, clientY, pressure }));
        });

        pointerState.listeners.onPointerMove = onMove;
        pointerState.listeners.onPointerUp = lastPointerUp = onUp;
        addEventListener(Events.pointerMove, onMove);
        addEventListener(Events.pointerUp, onUp);
        break;
      }
      case 'freedraw':
        const { clientX, clientY, pressure } = event;
        dispatch(strokeStart({ clientX, clientY, pressure }));

        const onMove = createThrottledHandler((event) => {
          const { clientX, clientY, target, pressure } = event;
          if (!(target instanceof HTMLElement)) return;

          // target 为 Canvas, 不应该通过 action dispatch 传递.
          dispatch(strokeUpdate({ clientX, clientY, pressure }));
        });

        const onUp = createHandler((event) => {
          lastPointerUp = null;
          if (!pointerState) return;

          removeEventListener(Events.pointerMove, pointerState.listeners.onPointerMove!);
          removeEventListener(Events.pointerUp, pointerState.listeners.onPointerUp!);
          let it = pointerState.listeners.onPointerMove;
          // 确保已经发出的 move 事件处理完毕.
          it && it.flush();

          const { clientX, clientY, pressure } = event;

          dispatch(strokeUpdate({ clientX, clientY, pressure }));
          console.log(freedrawState.freedraw, '#1');

          dispatch(addElement(freedrawState.freedraw!));
          dispatch(strokeStop({ element: freedrawState.freedraw!, historyLimit: 0 }));
        });

        pointerState.listeners.onPointerMove = onMove;
        pointerState.listeners.onPointerUp = lastPointerUp = onUp;
        addEventListener(Events.pointerMove, onMove);
        addEventListener(Events.pointerUp, onUp);
        break;
      case 'rect': {
        // dispatch()
        break;
      }
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
      <div style={{
        position: 'absolute',
        margin: '2ch',
        zIndex: -1,
      }}>
        <p>({(pos[0] + ',').padEnd(12) + (pos[1]).padEnd(9)})</p>
        <p>Selecting: ({(boardState.selectingArea?.map(v => v.toFixed(1).padStart(5)).join(',')) ?? 'none'})</p>
      </div>
      {/* 操作栏 */}
      <OperationUI
        canvas={canvasRef.current}
      />
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

      // context.translate(cx * 1.0, cy * 1.0)
      // const x = ((x2 - x1) / 2) * devicePixelRatio
      // const y = ((y2 - y1) / 2) * devicePixelRatio
      const { x, y } = freedraw;

      if (debug) {
        context.save();
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
    case 'image': {
      const imageElement = element as ImageElement;
      const oldImageCache = elementCanvasCaches.get(imageElement);
      if (!oldImageCache) {
        const newCache = generateImageCanvas(imageElement);
        elementCanvasCaches.set(imageElement, newCache);
      }

      const [elementCanvas, x, y] = oldImageCache ?? elementCanvasCaches.get(imageElement)!
      context.drawImage(elementCanvas, x, y);
    }
    case 'shape': {
      break;
    }
    default:
      break;
  }
}


function renderBoard(state: BoardState, canvas: HTMLCanvasElement) {
  const { renderConfig, allElements, selectingArea: selection } = state;

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

  console.time('gridDisplay');
  if (gridDisplay) {
    const width = canvas.width;
    const height = canvas.height;
    context.save();
    context.lineWidth = 1;
    context.strokeStyle = "rgba(0,0,0,0.1)";
    context.beginPath();

    for (let x = -gridSize; x < width + gridSize; x += gridSize) {
      context.moveTo(x, -gridSize);
      context.lineTo(x, height + gridSize * 2);
    }
    for (let y = -gridSize; y < height + gridSize; y += gridSize) {
      context.moveTo(-gridSize, y);
      context.lineTo(width + gridSize * 2, y);
    }
    context.stroke();
    context.restore();
  }
  console.timeEnd('gridDisplay');

  // render selection tooltip
  console.time('selection');
  if (selection) {
    // TODO: customizable style.
    context.save();
    context.strokeStyle = 'rgb(102, 204, 255)';
    context.lineWidth = 2;
    const [x1, y1, x2, y2] = selection;
    context.strokeRect(x1, y1, x2 - x1, y2 - y1);
    context.fillStyle = 'rgba(102, 204, 255, .4)';
    context.fillRect(x1, y1, x2 - x1, y2 - y1);
    context.restore();
  }
  console.timeEnd('selection');

  // render elements

  console.time('elements');
  allElements.ids.forEach(i => {
    const element = allElements.entities[i]!;
    try {
      utils.log(`🪝 hook: rendering %c'${element.id}'`, 'color: blue;');
      renderElement(element, context, debug);
      console.timeLog('elements');
      // console.log('# element from all render: ', element.id);
      if (element.selected) {
        const padding = 10;
        const [x1, y1, x2, y2] = getAbsoluteCoords(element as FreedrawElement);
        context.save();
        context.strokeStyle = 'rgb(102, 204, 255)';
        context.strokeRect(x1 - padding, y1 - padding, x2 - x1 + padding * 2, y2 - y1 + padding * 2);
        context.fillStyle = 'rgba(102, 204, 255, .2)';
        context.fillRect(x1 - padding, y1 - padding, x2 - x1 + padding * 2, y2 - y1 + padding * 2);
        context.restore();
      }
    } catch (error: any) {
      console.error(error);
    }
  });
  console.timeEnd('elements');
}

export default Whiteboard;
