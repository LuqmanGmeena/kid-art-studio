"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Brush, Eraser, Undo2, Redo2, Trash2, Download, Palette, Sparkles, Circle, Square } from "lucide-react"

interface DrawingToolbarProps {
  orientation?: "horizontal" | "vertical"
  className?: string
  onToolChange?: (tool: "brush" | "eraser") => void
  onColorChange?: (color: string) => void
  onBrushSizeChange?: (size: number) => void
  onBrushTypeChange?: (type: "round" | "square" | "texture") => void
  onUndo?: () => void
  onRedo?: () => void
  onClear?: () => void
  onSave?: () => void
  selectedTool?: "brush" | "eraser"
  selectedColor?: string
  brushSize?: number
  brushType?: "round" | "square" | "texture"
}

const colorPalettes = {
  basic: [
    { color: "#000000", name: "Black" },
    { color: "#ef4444", name: "Red" },
    { color: "#f97316", name: "Orange" },
    { color: "#eab308", name: "Yellow" },
    { color: "#22c55e", name: "Green" },
    { color: "#3b82f6", name: "Blue" },
    { color: "#8b5cf6", name: "Purple" },
    { color: "#ec4899", name: "Pink" },
  ],
  rainbow: [
    { color: "#ff0000", name: "Bright Red" },
    { color: "#ff8000", name: "Bright Orange" },
    { color: "#ffff00", name: "Bright Yellow" },
    { color: "#80ff00", name: "Lime Green" },
    { color: "#00ff00", name: "Bright Green" },
    { color: "#00ff80", name: "Spring Green" },
    { color: "#00ffff", name: "Cyan" },
    { color: "#0080ff", name: "Sky Blue" },
    { color: "#0000ff", name: "Bright Blue" },
    { color: "#8000ff", name: "Electric Purple" },
    { color: "#ff00ff", name: "Magenta" },
    { color: "#ff0080", name: "Hot Pink" },
  ],
  neon: [
    { color: "#ff073a", name: "Neon Red" },
    { color: "#ff6600", name: "Neon Orange" },
    { color: "#ffff00", name: "Neon Yellow" },
    { color: "#39ff14", name: "Neon Green" },
    { color: "#00ffff", name: "Neon Cyan" },
    { color: "#0066ff", name: "Neon Blue" },
    { color: "#9d00ff", name: "Neon Purple" },
    { color: "#ff1493", name: "Neon Pink" },
  ],
  pastels: [
    { color: "#ffb3ba", name: "Pastel Pink" },
    { color: "#ffdfba", name: "Pastel Peach" },
    { color: "#ffffba", name: "Pastel Yellow" },
    { color: "#baffc9", name: "Pastel Green" },
    { color: "#bae1ff", name: "Pastel Blue" },
    { color: "#d4baff", name: "Pastel Purple" },
    { color: "#ffbaff", name: "Pastel Magenta" },
    { color: "#f0f0f0", name: "Pastel Gray" },
  ],
}

export function DrawingToolbar({
  className,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onBrushTypeChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  selectedTool = "brush",
  selectedColor = "#000000",
  brushSize = 5,
  brushType = "round",
}: DrawingToolbarProps) {
  const [showColorPalette, setShowColorPalette] = useState(false)
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof colorPalettes>("basic")

  const handleToolChange = (tool: "brush" | "eraser") => onToolChange?.(tool)
  const handleColorChange = (color: string) => {
    onColorChange?.(color)
    setShowColorPalette(false)
  }
  const handleBrushSizeChange = (value: number[]) => onBrushSizeChange?.(value[0])
  const handleBrushTypeChange = (type: "round" | "square" | "texture") => onBrushTypeChange?.(type)
  const handleClear = () => window.confirm("Clear drawing?") && onClear?.()

  return (
    <div
      className={cn(
        "flex gap-2 p-2 sm:p-4 overflow-x-auto",
        "flex-row justify-start items-center",
        "bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-kid-primary/20",
        "touch-manipulation select-none",
        className,
      )}
      style={{
        touchAction: "manipulation",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Tools */}
      <Button
        variant={selectedTool === "brush" ? "default" : "outline"}
        className="kid-button w-14 h-14 flex items-center justify-center"
        onClick={() => handleToolChange("brush")}
      >
        <Brush className="h-6 w-6" />
      </Button>
      <Button
        variant={selectedTool === "eraser" ? "default" : "outline"}
        className="kid-button w-14 h-14 flex items-center justify-center"
        onClick={() => handleToolChange("eraser")}
      >
        <Eraser className="h-6 w-6" />
      </Button>

      {/* Brush Types */}
      <Button
        variant={brushType === "round" ? "default" : "outline"}
        className="kid-button w-12 h-12"
        onClick={() => handleBrushTypeChange("round")}
      >
        <Circle className="h-4 w-4" />
      </Button>
      <Button
        variant={brushType === "square" ? "default" : "outline"}
        className="kid-button w-12 h-12"
        onClick={() => handleBrushTypeChange("square")}
      >
        <Square className="h-4 w-4" />
      </Button>
      <Button
        variant={brushType === "texture" ? "default" : "outline"}
        className="kid-button w-12 h-12"
        onClick={() => handleBrushTypeChange("texture")}
      >
        <Sparkles className="h-4 w-4" />
      </Button>

      {/* Brush Size */}
      <div className="flex items-center gap-2 min-w-[140px]">
        <span className="text-sm">Size:</span>
        <Slider
          value={[brushSize]}
          onValueChange={handleBrushSizeChange}
          max={20}
          min={1}
          step={1}
          className="w-24"
        />
        <span className="text-xs">{brushSize}</span>
      </div>

      {/* Colors */}
      <div className="relative">
        <Button
          variant="outline"
          className="kid-button w-14 h-14"
          onClick={() => setShowColorPalette(!showColorPalette)}
        >
          <Palette className="h-5 w-5" />
          <div
            className="w-4 h-4 rounded-full border-2 border-white ml-2"
            style={{ backgroundColor: selectedColor }}
          />
        </Button>
        {showColorPalette && (
          <div className="absolute top-full mt-2 left-0 bg-card border rounded-xl p-3 shadow-lg z-20 min-w-[260px] max-w-[90vw]">
            <div className="flex gap-1 mb-2 overflow-x-auto">
              {Object.keys(colorPalettes).map((p) => (
                <button
                  key={p}
                  className={cn(
                    "px-2 py-1 text-xs rounded-md capitalize",
                    selectedPalette === p ? "bg-primary text-white" : "bg-muted"
                  )}
                  onClick={() => setSelectedPalette(p as keyof typeof colorPalettes)}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {colorPalettes[selectedPalette].map(({ color, name }) => (
                <button
                  key={color}
                  className={cn(
                    "w-10 h-10 rounded-full border transition-all",
                    selectedColor === color ? "border-accent ring-2" : "border-border"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  title={name}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <Button variant="outline" className="kid-button w-14 h-14" onClick={onUndo}>
        <Undo2 className="h-6 w-6" />
      </Button>
      <Button variant="outline" className="kid-button w-14 h-14" onClick={onRedo}>
        <Redo2 className="h-6 w-6" />
      </Button>
      <Button variant="outline" className="kid-button w-14 h-14 text-red-500" onClick={handleClear}>
        <Trash2 className="h-6 w-6" />
      </Button>
      <Button variant="secondary" className="kid-button w-14 h-14" onClick={onSave}>
        <Download className="h-6 w-6" />
      </Button>

      {/* Click outside to close palette */}
      {showColorPalette && (
        <div className="fixed inset-0 z-10" onClick={() => setShowColorPalette(false)} />
      )}
    </div>
  )
}
