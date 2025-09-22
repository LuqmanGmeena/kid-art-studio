"use client"

import { useEffect, useState, useRef } from "react"
import { DrawingCanvas, type DrawingCanvasRef } from "@/components/drawing-canvas"
import { DrawingToolbar } from "@/components/drawing-toolbar"
import { Gallery } from "@/components/gallery"
import { Challenges } from "@/components/challenges"
import { ChallengeModal } from "@/components/challenge-modal"
import { Badges } from "@/components/badges"
import { SafetySettings } from "@/components/moderation-tools"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Images, Paintbrush, LogOut, User, Trophy, Award, Settings, Globe } from "lucide-react"
import Link from "next/link"

interface Challenge {
  id: string
  title: string
  description: string
  prompt: string
  difficulty_level: number
  is_active: boolean
  start_date: string
  end_date: string
  created_at: string
}

export default function KidArtStudio() {
  const { user, loading, signOut } = useAuth()
  const isMobile = useMobile()
  const canvasRef = useRef<DrawingCanvasRef>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  const [selectedTool, setSelectedTool] = useState<"brush" | "eraser">("brush")
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)

  const [currentView, setCurrentView] = useState<"draw" | "gallery" | "challenges" | "badges" | "safety">("draw")
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [showChallengeModal, setShowChallengeModal] = useState(false)

  const [savedDrawings, setSavedDrawings] = useState<
    Array<{ id: string; dataUrl: string; timestamp: number; name: string }>
  >([])

  const updateCanvasSize = () => {
    if (typeof window !== "undefined") {
      const padding = 32 // 2rem padding
      const toolbarHeight = isMobile ? 80 : 60

      if (isMobile) {
        // Mobile: full width and height minus toolbar
        setCanvasSize({
          width: window.innerWidth - padding,
          height: window.innerHeight - toolbarHeight - padding,
        })
      } else {
        // Desktop: centered with max 70% width, 80% height
        const maxWidth = Math.min(window.innerWidth * 0.7, 1200)
        const maxHeight = Math.min(window.innerHeight * 0.8, 800)
        setCanvasSize({
          width: maxWidth - padding,
          height: maxHeight - padding,
        })
      }
    }
  }

  useEffect(() => {
    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    window.addEventListener("orientationchange", updateCanvasSize)

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      window.removeEventListener("orientationchange", updateCanvasSize)
    }
  }, [isMobile])

  useEffect(() => {
    const saved = localStorage.getItem("kid-art-drawings")
    if (saved) {
      try {
        setSavedDrawings(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to load saved drawings:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("kid-art-drawings", JSON.stringify(savedDrawings))
  }, [savedDrawings])

  const handleToolChange = (tool: "brush" | "eraser") => {
    setSelectedTool(tool)
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
  }

  const handleBrushSizeChange = (size: number) => {
    setBrushSize(size)
  }

  const handleUndo = () => {
    canvasRef.current?.undo()
  }

  const handleRedo = () => {
    canvasRef.current?.redo()
  }

  const handleClear = () => {
    canvasRef.current?.clearCanvas()
  }

  const handleSave = async () => {
    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return

    const dataUrl = canvas.toDataURL("image/png")
    const timestamp = Date.now()
    const name = activeChallenge
      ? `${activeChallenge.title} - ${new Date(timestamp).toLocaleDateString()}`
      : `Artwork ${new Date(timestamp).toLocaleDateString()}`

    const newDrawing = {
      id: `drawing-${timestamp}`,
      dataUrl,
      timestamp,
      name,
    }

    setSavedDrawings((prev) => [newDrawing, ...prev])

    try {
      const supabase = createClient()
      const { data: drawingData, error: drawingError } = await supabase
        .from("drawings")
        .insert({
          user_id: user.id,
          title: name,
          canvas_data: dataUrl,
          thumbnail_url: dataUrl,
        })
        .select()
        .single()

      if (drawingError) throw drawingError

      if (activeChallenge && drawingData) {
        await supabase.from("challenge_completions").insert({
          user_id: user.id,
          challenge_id: activeChallenge.id,
          drawing_id: drawingData.id,
        })

        setActiveChallenge(null)
        alert(`Congratulations! You completed the "${activeChallenge.title}" challenge!`)
      }
    } catch (error) {
      console.error("Failed to save to database:", error)
    }

    const link = document.createElement("a")
    link.download = `kid-art-${timestamp}.png`
    link.href = dataUrl
    link.click()
  }

  const handleDeleteDrawing = (id: string) => {
    setSavedDrawings((prev) => prev.filter((drawing) => drawing.id !== id))
  }

  const handleDownloadDrawing = (dataUrl: string, name: string) => {
    const link = document.createElement("a")
    link.download = `${name}.png`
    link.href = dataUrl
    link.click()
  }

  const handleStartChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge)
    setShowChallengeModal(true)
  }

  const handleStartDrawingFromChallenge = () => {
    setCurrentView("draw")
    setShowChallengeModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kid-primary via-kid-secondary to-kid-accent flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <p className="text-2xl font-bold text-white">Loading Kid Art Studio...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kid-primary/20 via-kid-secondary/20 to-kid-accent/20 flex items-center justify-center p-4">
        <div className="text-center bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md border-4 border-kid-primary/30">
          <div className="text-6xl mb-4">🎨</div>
          <h1 className="text-4xl md:text-5xl font-bold text-kid-primary mb-4">Kid Art Studio</h1>
          <p className="text-lg text-kid-text mb-6">Sign in to start creating amazing digital art!</p>
          <div className="space-y-3">
            <Button
              asChild
              className="w-full h-12 text-lg font-bold bg-kid-primary hover:bg-kid-primary/90 text-white rounded-2xl"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-12 text-lg font-bold border-2 border-kid-primary text-kid-primary hover:bg-kid-primary/10 bg-transparent rounded-2xl"
            >
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kid-primary/20 via-kid-secondary/20 to-kid-accent/20 p-4">
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-center mb-4">
          <div className="flex items-center justify-between w-full max-w-4xl mb-4">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-kid-primary" />
              <span className="text-lg font-semibold text-kid-text">Welcome back!</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-kid-primary text-kid-primary hover:bg-kid-primary/10 bg-transparent rounded-xl"
              >
                <Link href="/gallery">
                  <Globe className="h-4 w-4 mr-2" />
                  Community Gallery
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="border-kid-primary text-kid-primary hover:bg-kid-primary/10 bg-transparent rounded-xl"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-kid-primary mb-2">🎨 Kid Art Studio</h1>
          <p className="text-lg text-kid-text mb-4">
            {currentView === "draw"
              ? activeChallenge
                ? `Challenge: ${activeChallenge.title}`
                : "Create amazing digital art!"
              : currentView === "gallery"
                ? "Your amazing artwork collection!"
                : currentView === "challenges"
                  ? "Take on fun drawing challenges!"
                  : currentView === "badges"
                    ? "Your badge collection and progress!"
                    : "Safety settings and parental controls"}
          </p>

          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              variant={currentView === "draw" ? "default" : "outline"}
              size="lg"
              className="kid-button"
              onClick={() => setCurrentView("draw")}
            >
              <Paintbrush className="h-5 w-5 mr-2" />
              Draw
            </Button>
            <Button
              variant={currentView === "challenges" ? "default" : "outline"}
              size="lg"
              className="kid-button"
              onClick={() => setCurrentView("challenges")}
            >
              <Trophy className="h-5 w-5 mr-2" />
              Challenges
            </Button>
            <Button
              variant={currentView === "badges" ? "default" : "outline"}
              size="lg"
              className="kid-button"
              onClick={() => setCurrentView("badges")}
            >
              <Award className="h-5 w-5 mr-2" />
              Badges
            </Button>
            <Button
              variant={currentView === "gallery" ? "default" : "outline"}
              size="lg"
              className="kid-button"
              onClick={() => setCurrentView("gallery")}
            >
              <Images className="h-5 w-5 mr-2" />
              Gallery ({savedDrawings.length})
            </Button>
            <Button
              variant={currentView === "safety" ? "default" : "outline"}
              size="lg"
              className="kid-button"
              onClick={() => setCurrentView("safety")}
            >
              <Settings className="h-5 w-5 mr-2" />
              Safety
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full max-w-7xl">
          {currentView === "draw" ? (
            <>
              {activeChallenge && (
                <div className="bg-gradient-to-r from-kid-primary/10 to-kid-secondary/10 p-4 rounded-xl border border-kid-primary/20 max-w-2xl">
                  <h3 className="font-bold text-kid-primary mb-2">Active Challenge: {activeChallenge.title}</h3>
                  <p className="text-sm text-kid-text italic">"{activeChallenge.prompt}"</p>
                </div>
              )}

              {!isMobile && (
                <DrawingToolbar
                  orientation="horizontal"
                  className="toolbar"
                  onToolChange={handleToolChange}
                  onColorChange={handleColorChange}
                  onBrushSizeChange={handleBrushSizeChange}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onClear={handleClear}
                  onSave={handleSave}
                  selectedTool={selectedTool}
                  selectedColor={selectedColor}
                  brushSize={brushSize}
                />
              )}

              <div className="canvas-container relative">
                <DrawingCanvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  tool={selectedTool}
                  color={selectedColor}
                  brushSize={brushSize}
                />
              </div>

              {isMobile && (
                <DrawingToolbar
                  orientation="horizontal"
                  className="toolbar fixed bottom-4 left-4 right-4 z-10"
                  onToolChange={handleToolChange}
                  onColorChange={handleColorChange}
                  onBrushSizeChange={handleBrushSizeChange}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onClear={handleClear}
                  onSave={handleSave}
                  selectedTool={selectedTool}
                  selectedColor={selectedColor}
                  brushSize={brushSize}
                />
              )}
            </>
          ) : currentView === "challenges" ? (
            <Challenges onStartChallenge={handleStartChallenge} />
          ) : currentView === "badges" ? (
            <Badges />
          ) : currentView === "safety" ? (
            <SafetySettings />
          ) : (
            <Gallery drawings={savedDrawings} onDelete={handleDeleteDrawing} onDownload={handleDownloadDrawing} />
          )}
        </div>
      </div>

      <ChallengeModal
        challenge={activeChallenge}
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        onStartDrawing={handleStartDrawingFromChallenge}
      />
    </div>
  )
}
