"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createBrowserClient } from "@supabase/ssr"
import { Eye, Download, Share2, Shield, Clock, Trophy, Star } from "lucide-react"

interface Drawing {
  id: string
  title: string
  created_at: string
  image_url: string
  challenge_id?: string
}

interface Challenge {
  id: string
  title: string
  completed: boolean
  completed_at?: string
}

interface UserBadge {
  id: string
  name: string
  description: string
  icon: string
  earned_at?: string
}

export function ParentDashboard() {
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchParentData()
  }, [])

  const fetchParentData = async () => {
    try {
      // Fetch child's drawings
      const { data: drawingsData } = await supabase
        .from("drawings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      // Fetch challenge progress
      const { data: challengesData } = await supabase.from("challenges").select(`
          id,
          title,
          challenge_completions (
            completed_at
          )
        `)

      // Fetch earned badges
      const { data: badgesData } = await supabase.from("user_badges").select(`
          earned_at,
          badges (
            id,
            name,
            description,
            icon
          )
        `)

      setDrawings(drawingsData || [])
      setChallenges(
        challengesData?.map((c) => ({
          id: c.id,
          title: c.title,
          completed: c.challenge_completions.length > 0,
          completed_at: c.challenge_completions[0]?.completed_at,
        })) || [],
      )
      setBadges(
        badgesData?.map((b) => ({
          ...b.badges,
          earned_at: b.earned_at,
        })) || [],
      )
    } catch (error) {
      console.error("Error fetching parent data:", error)
    } finally {
      setLoading(false)
    }
  }

  const shareDrawing = async (drawing: Drawing) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${drawing.title} - Kid Art Studio`,
          text: "Check out this amazing artwork!",
          url: drawing.image_url,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(drawing.image_url)
      alert("Drawing link copied to clipboard!")
    }
  }

  const downloadDrawing = (drawing: Drawing) => {
    const link = document.createElement("a")
    link.href = drawing.image_url
    link.download = `${drawing.title}.png`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const completedChallenges = challenges.filter((c) => c.completed).length
  const totalChallenges = challenges.length
  const progressPercentage = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-primary">Parent Dashboard</h1>
          <p className="text-muted-foreground">Monitor your child's creative journey</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drawings</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{drawings.length}</div>
            <p className="text-xs text-muted-foreground">Creative masterpieces</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Challenges Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {completedChallenges}/{totalChallenges}
            </div>
            <Progress value={progressPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{badges.length}</div>
            <p className="text-xs text-muted-foreground">Achievement unlocked!</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gallery" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gallery">Art Gallery</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Artwork</CardTitle>
              <CardDescription>Your child's latest creative expressions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drawings.map((drawing) => (
                  <Card key={drawing.id} className="overflow-hidden">
                    <div className="aspect-square bg-muted relative">
                      <img
                        src={drawing.image_url || "/placeholder.svg"}
                        alt={drawing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{drawing.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(drawing.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => shareDrawing(drawing)} className="flex-1">
                          <Share2 className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadDrawing(drawing)} className="flex-1">
                          <Download className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Challenge Progress</CardTitle>
              <CardDescription>Track your child's learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{challenge.title}</h4>
                      {challenge.completed && challenge.completed_at && (
                        <p className="text-sm text-muted-foreground">
                          Completed on {new Date(challenge.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge variant={challenge.completed ? "default" : "secondary"}>
                      {challenge.completed ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Badges</CardTitle>
              <CardDescription>Celebrate your child's accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <Card key={badge.id} className="text-center p-4">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <h3 className="font-semibold">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                    {badge.earned_at && (
                      <Badge variant="secondary" className="text-xs">
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                      </Badge>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
