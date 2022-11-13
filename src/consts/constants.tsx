import { AllTools, ToolsInBar } from "../models/types"
import { Cursor, ArrowRight, Square, Fonts, Images, Pen, Circle } from 'react-bootstrap-icons'
import { createElement, ReactElement, ReactNode } from "react";

interface ToolType {
    type: ToolsInBar,
    icon: ReactNode,
    shortCut: 't'
    | 'x'
    | 'r'
    | 'v'
    | 'o'
    | null,
}

export const TOOLS: ToolType[] = [
    {
        type: 'selector',
        icon: <Cursor />,
        shortCut: 'v',
    },
    {
        type: 'rect',
        icon: <Square />,
        shortCut: 'r',
    },
    {
        type: 'circle',
        icon: <Circle />,
        shortCut: 'o'
    },
    {
        type: 'freedraw',
        icon: <Pen />,
        shortCut: 'x',
    },
    {
        type: 'text',
        icon: <Fonts />,
        shortCut: 't',
    },
    {
        type: 'image',
        icon: <Images />,
        shortCut: null
    }
]

export const CURSOR_TYPE = {
    TEXT: "text",
    CROSSHAIR: "crosshair",
    GRABBING: "grabbing",
    GRAB: "grab",
    POINTER: "pointer",
    MOVE: "move",
    AUTO: "",
};

export type FileExtension = 'gif'
    | 'jpg'
    | 'jpg'
    | 'png'
    | 'svg'

export const MIME_TYPES = {
    json: "application/json",
    svg: "image/svg+xml",
    "excalidraw.svg": "image/svg+xml",
    png: "image/png",
    "excalidraw.png": "image/png",
    jpg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    ico: "image/x-icon",
    binary: "application/octet-stream",
} as const;