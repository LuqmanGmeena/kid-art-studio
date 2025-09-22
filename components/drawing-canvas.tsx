"use client"

import type React from "react"

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { cn } from "@/lib/utils"

interface DrawingCanvasProps {
  width: number
  height: number
  className?: string
  tool?: "brush" | "eraser"
  color?: string
  brushSize?: number
  brushType?: "round" | "square" | "texture"
}

export interface DrawingCanvasRef {
  clearCanvas: () => void
  saveCanvas: () => void
  undo: () => void
  redo: () => void
  getCanvas: () => HTMLCanvasElement | null
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  ({ width, height, className, tool = "brush", color = "#000000", brushSize = 5, brushType = "round" }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const contextRef = useRef<CanvasRenderingContext2D | null>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [history, setHistory] = useState<ImageData[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)

    // Initialize canvas
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Set canvas size
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext("2d")
      if (!context) return

      // Configure context
      context.lineCap = "round"
      context.lineJoin = "round"
      context.fillStyle = "#ffffff"
      context.fillRect(0, 0, width, height)

      contextRef.current = context

      // Save initial state
      const initialState = context.getImageData(0, 0, width, height)
      setHistory([initialState])
      setHistoryIndex(0)
    }, [width, height])

    useEffect(() => {
      if (contextRef.current) {
        if (tool === "eraser") {
          contextRef.current.globalCompositeOperation = "destination-out"
          contextRef.current.lineWidth = brushSize * 2
        } else {
          contextRef.current.globalCompositeOperation = "source-over"
          contextRef.current.strokeStyle = color
          contextRef.current.lineWidth = brushSize

          // Apply brush type effects
          if (brushType === "square") {
            contextRef.current.lineCap = "square"
            contextRef.current.lineJoin = "miter"
          } else if (brushType === "texture") {
            contextRef.current.lineCap = "round"
            contextRef.current.lineJoin = "round"
            contextRef.current.shadowColor = color
            contextRef.current.shadowBlur = brushSize / 2
          } else {
            contextRef.current.lineCap = "round"
            contextRef.current.lineJoin = "round"
            contextRef.current.shadowBlur = 0
          }
        }
      }
    }, [color, brushSize, tool, brushType])

    const saveToHistory = () => {
      if (!contextRef.current || !canvasRef.current) return

      const imageData = contextRef.current.getImageData(0, 0, width, height)
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(imageData)

      // Limit history to 20 states
      if (newHistory.length > 20) {
        newHistory.shift()
      } else {
        setHistoryIndex((prev) => prev + 1)
      }

      setHistory(newHistory)
    }

    const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      if ("touches" in e) {
        // Prevent scrolling and zooming on touch
        e.preventDefault()
        const touch = e.touches[0] || e.changedTouches[0]
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        }
      } else {
        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        }
      }
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!contextRef.current) return

      const { x, y } = getEventPos(e)
      contextRef.current.beginPath()
      contextRef.current.moveTo(x, y)
      setIsDrawing(true)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!isDrawing || !contextRef.current) return

      const { x, y } = getEventPos(e)

      if (brushType === "texture") {
        // Add texture effect with multiple small strokes
        for (let i = 0; i < 3; i++) {
          const offsetX = (Math.random() - 0.5) * brushSize * 0.3
          const offsetY = (Math.random() - 0.5) * brushSize * 0.3
          contextRef.current.lineTo(x + offsetX, y + offsetY)
          contextRef.current.stroke()
          contextRef.current.beginPath()
          contextRef.current.moveTo(x + offsetX, y + offsetY)
        }
      } else {
        contextRef.current.lineTo(x, y)
        contextRef.current.stroke()
      }
    }

    const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!isDrawing) return

      setIsDrawing(false)
      saveToHistory()
    }

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      clearCanvas: () => {
        if (!contextRef.current || !canvasRef.current) return
        contextRef.current.fillStyle = "#ffffff"
        contextRef.current.fillRect(0, 0, width, height)
        saveToHistory()
      },
      saveCanvas: () => {
        if (!canvasRef.current) return
        const link = document.createElement("a")
        link.download = `kid-art-${Date.now()}.png`
        link.href = canvasRef.current.toDataURL()
        link.click()
      },
      undo: () => {
        if (historyIndex > 0 && contextRef.current) {
          const newIndex = historyIndex - 1
          contextRef.current.putImageData(history[newIndex], 0, 0)
          setHistoryIndex(newIndex)
        }
      },
      redo: () => {
        if (historyIndex < history.length - 1 && contextRef.current) {
          const newIndex = historyIndex + 1
          contextRef.current.putImageData(history[newIndex], 0, 0)
          setHistoryIndex(newIndex)
        }
      },
      getCanvas: () => canvasRef.current,
    }))

    return (
      <canvas
        ref={canvasRef}
        className={cn(
          "border-2 border-border rounded-lg bg-white cursor-crosshair touch-none select-none",
          "max-w-full max-h-full object-contain",
          className,
        )}
        style={{
          width: "100%",
          height: "auto",
          maxWidth: `${width}px`,
          maxHeight: `${height}px`,
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          WebkitTapHighlightColor: "transparent",
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onContextMenu={(e) => e.preventDefault()}
      />
    )
  },
)

DrawingCanvas.displayName = "DrawingCanvas"
