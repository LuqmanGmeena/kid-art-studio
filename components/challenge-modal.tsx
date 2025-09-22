"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Trophy, X } from "lucide-react"

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

interface ChallengeModalProps {
  challenge: Challenge | null
  isOpen: boolean
  onClose: () => void
  onStartDrawing: () => void
}

export function ChallengeModal({ challenge, isOpen, onClose, onStartDrawing }: ChallengeModalProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!challenge) return null

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-500"
      case 2:
        return "bg-yellow-500"
      case 3:
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1:
        return "Easy"
      case 2:
        return "Medium"
      case 3:
        return "Hard"
      default:
        return "Unknown"
    }
  }

  const handleStartChallenge = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      // Mark challenge as started (we'll complete it when they save their drawing)
      onStartDrawing()
      onClose()
    } catch (error) {
      console.error("Error starting challenge:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl text-kid-primary">{challenge.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`${getDifficultyColor(challenge.difficulty_level)} text-white`}>
                  {getDifficultyText(challenge.difficulty_level)}
                </Badge>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-kid-accent" />
                  <span className="text-sm text-kid-text">Challenge</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-kid-text hover:text-kid-primary">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <DialogDescription className="text-lg text-kid-text">{challenge.description}</DialogDescription>

          <div className="bg-gradient-to-r from-kid-primary/10 to-kid-secondary/10 p-6 rounded-xl border border-kid-primary/20">
            <h3 className="text-lg font-bold text-kid-primary mb-3 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Your Challenge
            </h3>
            <p className="text-kid-text text-lg leading-relaxed italic">"{challenge.prompt}"</p>
          </div>

          <div className="bg-kid-accent/10 p-4 rounded-lg">
            <h4 className="font-semibold text-kid-primary mb-2">Tips for Success:</h4>
            <ul className="text-sm text-kid-text space-y-1">
              <li>• Take your time and have fun with it!</li>
              <li>• Use lots of colors to make your drawing pop</li>
              <li>• Don't worry about making it perfect - creativity is key!</li>
              <li>• Save your drawing when you're done to complete the challenge</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleStartChallenge}
              disabled={isSubmitting}
              className="flex-1 h-12 text-lg font-bold bg-kid-primary hover:bg-kid-primary/90 text-white"
            >
              {isSubmitting ? (
                "Starting..."
              ) : (
                <>
                  <Star className="h-5 w-5 mr-2" />
                  Start Drawing!
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 h-12 border-kid-primary text-kid-primary hover:bg-kid-primary/10 bg-transparent"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
