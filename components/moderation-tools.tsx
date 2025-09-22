"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, Flag, Shield, MessageCircle } from "lucide-react"

interface ReportModalProps {
  drawingId: string
  drawingTitle: string
  onReportSubmitted: () => void
}

export function ReportModal({ drawingId, drawingTitle, onReportSubmitted }: ReportModalProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reportReasons = [
    "Inappropriate content",
    "Bullying or harassment",
    "Spam or repetitive content",
    "Violence or harmful content",
    "Other safety concern",
  ]

  const handleSubmitReport = async () => {
    if (!user || !reason.trim()) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()

      await supabase.from("reports").insert({
        reporter_id: user.id,
        drawing_id: drawingId,
        reason: reason,
        description: description.trim() || null,
        status: "pending",
      })

      setIsOpen(false)
      setReason("")
      setDescription("")
      onReportSubmitted()

      alert("Thank you for your report. Our team will review it soon.")
    } catch (error) {
      console.error("Error submitting report:", error)
      alert("There was an error submitting your report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
          <Flag className="h-4 w-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Report Drawing
          </DialogTitle>
          <DialogDescription>Help us keep Kid Art Studio safe by reporting inappropriate content.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Reporting: "{drawingTitle}"</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Why are you reporting this?</label>
            <div className="space-y-2">
              {reportReasons.map((reportReason) => (
                <label key={reportReason} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={reportReason}
                    checked={reason === reportReason}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-red-600"
                  />
                  <span className="text-sm text-gray-700">{reportReason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Additional details (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional context..."
              className="min-h-[80px]"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmitReport}
              disabled={!reason.trim() || isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="px-6">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface SafetyBannerProps {
  userAge?: number
}

export function SafetyBanner({ userAge }: SafetyBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Card className="bg-blue-50 border-blue-200 mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-800 mb-1">Stay Safe Online!</h3>
            <p className="text-sm text-blue-700 mb-2">
              {userAge && userAge < 13
                ? "Remember: Never share personal information like your real name, address, or school. If you see something that makes you uncomfortable, tell a grown-up right away!"
                : "Keep your personal information private and report any content that makes you uncomfortable."}
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                <MessageCircle className="h-3 w-3 mr-1" />
                Talk to a parent
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                <Flag className="h-3 w-3 mr-1" />
                Report concerns
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-blue-600 hover:text-blue-800 p-1"
          >
            ×
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface ContentFilterProps {
  children: React.ReactNode
  drawingData?: string
}

export function ContentFilter({ children, drawingData }: ContentFilterProps) {
  // This is a placeholder for content filtering logic
  // In a real implementation, you would:
  // 1. Analyze the drawing data for inappropriate content
  // 2. Use AI/ML services for image content moderation
  // 3. Check against known inappropriate patterns

  const [isFiltered, setIsFiltered] = useState(false)

  // Placeholder filtering logic - in reality this would be more sophisticated
  const checkContent = () => {
    // This would integrate with content moderation APIs
    return false // Assume content is safe for now
  }

  if (isFiltered) {
    return (
      <Card className="bg-yellow-50 border-yellow-200 p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Content Under Review</h3>
        <p className="text-yellow-700">
          This content is being reviewed by our safety team to ensure it meets our community guidelines.
        </p>
      </Card>
    )
  }

  return <>{children}</>
}

export function SafetySettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    allowPublicSharing: false,
    requireParentApproval: true,
    enableSafeSearch: true,
    blockDirectMessages: true,
  })

  const handleSettingChange = async (setting: string, value: boolean) => {
    try {
      const supabase = createClient()

      await supabase.from("user_safety_settings").upsert({
        user_id: user.id,
        [setting]: value,
        updated_at: new Date().toISOString(),
      })

      setSettings((prev) => ({ ...prev, [setting]: value }))
    } catch (error) {
      console.error("Error updating safety settings:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <Shield className="h-5 w-5" />
          Safety Settings
        </CardTitle>
        <CardDescription>Manage your privacy and safety preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Allow public sharing</p>
            <p className="text-sm text-gray-500">Let others see your drawings in the public gallery</p>
          </div>
          <input
            type="checkbox"
            checked={settings.allowPublicSharing}
            onChange={(e) => handleSettingChange("allowPublicSharing", e.target.checked)}
            className="h-4 w-4 text-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Require parent approval</p>
            <p className="text-sm text-gray-500">Get parent permission before sharing drawings</p>
          </div>
          <input
            type="checkbox"
            checked={settings.requireParentApproval}
            onChange={(e) => handleSettingChange("requireParentApproval", e.target.checked)}
            className="h-4 w-4 text-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Enable safe browsing</p>
            <p className="text-sm text-gray-500">Filter content to show only age-appropriate drawings</p>
          </div>
          <input
            type="checkbox"
            checked={settings.enableSafeSearch}
            onChange={(e) => handleSettingChange("enableSafeSearch", e.target.checked)}
            className="h-4 w-4 text-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Block direct messages</p>
            <p className="text-sm text-gray-500">Prevent other users from sending you messages</p>
          </div>
          <input
            type="checkbox"
            checked={settings.blockDirectMessages}
            onChange={(e) => handleSettingChange("blockDirectMessages", e.target.checked)}
            className="h-4 w-4 text-blue-600"
          />
        </div>
      </CardContent>
    </Card>
  )
}
