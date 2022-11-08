import React, { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { Provider } from 'react-redux'
import { Events } from './consts/Events'
import { CommonElement } from './models/ElementBase'
// import { Drawable } from 'roughjs/bin/core'

const elementCaches = new WeakMap<CommonElement, CanvasElement>()

function App() {

  // darkmode support
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
  }, [])

  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const onTapStart = (evt: TouchEvent) => {
      console.log('onTapStart: ' + Date.now() / 1000)
    }

    const onTapEnd = (evt: TouchEvent) => {
      console.log('onTapEnd: ' + Date.now() / 1000)
    }

    canvas.current?.addEventListener(Events.touchStart, onTapStart)
    canvas.current?.addEventListener(Events.touchStart, onTapEnd)

    return () => {
      canvas.current?.removeEventListener(Events.touchStart, onTapStart)
      canvas.current?.removeEventListener(Events.touchStart, onTapEnd)
    }
  }, [canvas.current])

  const [onBoard, setOnBoard] = useState<CommonElement[]>([])
  const renderBoard = () => {
    const context = canvas.current?.getContext('2d')
    const gridSize = 16 // in css pixels

    // draw grid lines
    if (canvas.current && context) {
      const width = canvas.current.width;
      const height = canvas.current.height;
      context.save();
      context.lineWidth = 1;
      context.strokeStyle = "rgba(0,0,0,0.1)";
      context.beginPath();

      for (let x = 0; x < width + gridSize * 2; x += gridSize) {
        context.moveTo(x, -gridSize);
        context.lineTo(x, height + gridSize * 2);
      }
      for (let y = 0; y < height + gridSize * 2; y += gridSize) {
        context.moveTo(-gridSize, y);
        context.lineTo(width + gridSize * 2, y);
      }
      context.stroke();
      context.restore();
    }

    onBoard.forEach(ele => {
      // render element
      const cache = elementCaches.get(ele)

      if (!cache) {

      }
    })

  }

  useEffect(renderBoard, [onBoard]);

  const onPointerMove = ({ pointerId, pressure, tangentialPressure, tiltX, tiltY, twist, width, height, pointerType, isPrimary }: React.PointerEvent<HTMLCanvasElement>) => {

  }

  // TODO: 宽高和 100% 有差距，需调整
  return (
    <div className="App">
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvas}
        onPointerMove={onPointerMove}
      >
        {/* TODO: i18n */}
        Online Whiteboard
      </canvas>
    </div>
  )
}

export default App
