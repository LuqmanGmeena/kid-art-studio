"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Trash2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReportModal, ContentFilter, SafetyBanner } from "@/components/moderation-tools"

interface Drawing {
  id: string
  dataUrl: string
  timestamp: number
  name: string
}

interface GalleryProps {
  drawings: Drawing[]
  onDelete: (id: string) => void
  onDownload: (dataUrl: string, name: string) => void
}

export function Gallery({ drawings, onDelete, onDownload }: GalleryProps) {
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null)

  const handleDelete = (drawing: Drawing) => {
    if (window.confirm(`Are you sure you want to delete "${drawing.name}"?`)) {
      onDelete(drawing.id)
      if (selectedDrawing?.id === drawing.id) {
        setSelectedDrawing(null)
      }
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleReportSubmitted = () => {
    // Could refresh the gallery or show a success message
    console.log("Report submitted successfully")
  }

  if (drawings.length === 0) {
    return (
      <div className="w-full max-w-6xl">
        <SafetyBanner />
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-2xl font-bold text-muted-foreground mb-2">No artwork yet!</h3>
          <p className="text-muted-foreground">Start drawing to see your amazing creations here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl">
      <SafetyBanner />

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {drawings.map((drawing) => (
          <ContentFilter key={drawing.id} drawingData={drawing.dataUrl}>
            <Card
              className={cn(
                "overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105",
                selectedDrawing?.id === drawing.id && "ring-2 ring-primary shadow-lg scale-105",
              )}
              onClick={() => setSelectedDrawing(drawing)}
            >
              <CardContent className="p-0">
                <div className="aspect-square relative bg-white">
                  <img
                    src={drawing.dataUrl || "/placeholder.svg"}
                    alt={drawing.name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                    <Eye className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm truncate mb-1">{drawing.name}</h4>
                  <p className="text-xs text-muted-foreground">{formatDate(drawing.timestamp)}</p>
                </div>
              </CardContent>
            </Card>
          </ContentFilter>
        ))}
      </div>

      {/* Selected Drawing Preview */}
      {selectedDrawing && (
        <ContentFilter drawingData={selectedDrawing.dataUrl}>
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Large Preview */}
                <div className="flex-1">
                  <div className="bg-white rounded-lg p-4 shadow-inner">
                    <img
                      src={selectedDrawing.dataUrl || "/placeholder.svg"}
                      alt={selectedDrawing.name}
                      className="w-full h-auto max-h-96 object-contain mx-auto"
                    />
                  </div>
                </div>

                {/* Drawing Info and Actions */}
                <div className="lg:w-64 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{selectedDrawing.name}</h3>
                    <p className="text-muted-foreground text-sm">Created on {formatDate(selectedDrawing.timestamp)}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="kid-button w-full"
                      onClick={() => onDownload(selectedDrawing.dataUrl, selectedDrawing.name)}
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="kid-button w-full text-destructive hover:text-destructive bg-transparent"
                      onClick={() => handleDelete(selectedDrawing)}
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Delete
                    </Button>

                    <ReportModal
                      drawingId={selectedDrawing.id}
                      drawingTitle={selectedDrawing.name}
                      onReportSubmitted={handleReportSubmitted}
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => setSelectedDrawing(null)}
                  >
                    Close Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </ContentFilter>
      )}
    </div>
  )
}
