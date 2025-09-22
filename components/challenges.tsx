"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, CheckCircle, Calendar, Lock } from "lucide-react"

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

interface ChallengeCompletion {
  id: string
  challenge_id: string
  completed_at: string
}

interface ChallengesProps {
  onStartChallenge: (challenge: Challenge) => void
}

interface WeeklyChallenge {
  week: number
  title: string
  emoji: string
  challenges: Challenge[]
  isUnlocked: boolean
  completedCount: number
}

export function Challenges({ onStartChallenge }: ChallengesProps) {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [completions, setCompletions] = useState<ChallengeCompletion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchChallenges = async () => {
      const supabase = createClient()

      try {
        // Fetch active challenges
        const { data: challengesData, error: challengesError } = await supabase
          .from("challenges")
          .select("*")
          .eq("is_active", true)
          .order("start_date", { ascending: true })

        if (challengesError) throw challengesError

        // Fetch user's completions
        const { data: completionsData, error: completionsError } = await supabase
          .from("challenge_completions")
          .select("*")
          .eq("user_id", user.id)

        if (completionsError) throw completionsError

        setChallenges(challengesData || [])
        setCompletions(completionsData || [])
      } catch (error) {
        console.error("Error fetching challenges:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [user])

  const isCompleted = (challengeId: string) => {
    return completions.some((completion) => completion.challenge_id === challengeId)
  }

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

  const isWeekUnlocked = (weekNumber: number) => {
    const now = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (startDate.getDay() || 7) + 1) // Start of current week (Monday)

    const weekStartDate = new Date(startDate)
    weekStartDate.setDate(weekStartDate.getDate() + (weekNumber - 1) * 7)

    return now >= weekStartDate
  }

  const organizeByWeeks = (): WeeklyChallenge[] => {
    const weeks: WeeklyChallenge[] = [
      { week: 1, title: "Daily Environment", emoji: "🏠", challenges: [], isUnlocked: true, completedCount: 0 },
      { week: 2, title: "Vehicles", emoji: "🚗", challenges: [], isUnlocked: false, completedCount: 0 },
      { week: 3, title: "Food & Drinks", emoji: "🍎", challenges: [], isUnlocked: false, completedCount: 0 },
      { week: 4, title: "Animals & Nature", emoji: "🐶", challenges: [], isUnlocked: false, completedCount: 0 },
      { week: 5, title: "Imagination & Creativity", emoji: "🌍", challenges: [], isUnlocked: false, completedCount: 0 },
    ]

    // Group challenges by week based on their titles and start dates
    challenges.forEach((challenge) => {
      if (
        challenge.title.includes("🏠") ||
        challenge.title.includes("🌳") ||
        challenge.title.includes("☀️") ||
        challenge.title.includes("🎒")
      ) {
        weeks[0].challenges.push(challenge)
      } else if (
        challenge.title.includes("🚗") ||
        challenge.title.includes("🚌") ||
        challenge.title.includes("🚴") ||
        challenge.title.includes("✈️")
      ) {
        weeks[1].challenges.push(challenge)
      } else if (
        challenge.title.includes("🍎") ||
        challenge.title.includes("🍔") ||
        challenge.title.includes("🥤") ||
        challenge.title.includes("🎂")
      ) {
        weeks[2].challenges.push(challenge)
      } else if (
        challenge.title.includes("🐶") ||
        challenge.title.includes("🐟") ||
        challenge.title.includes("🦋") ||
        challenge.title.includes("🌸")
      ) {
        weeks[3].challenges.push(challenge)
      } else if (
        challenge.title.includes("🤖") ||
        challenge.title.includes("🚀") ||
        challenge.title.includes("🏰") ||
        challenge.title.includes("🦸")
      ) {
        weeks[4].challenges.push(challenge)
      }
    })

    // Calculate completion counts and unlock status
    weeks.forEach((week, index) => {
      week.completedCount = week.challenges.filter((challenge) => isCompleted(challenge.id)).length
      week.isUnlocked = index === 0 || isWeekUnlocked(week.week)
    })

    return weeks
  }

  const weeklyData = organizeByWeeks()
  const completedCount = completions.length
  const totalChallenges = challenges.length
  const progressPercentage = totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-lg text-kid-text">Loading challenges...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-kid-primary/10 to-kid-secondary/10 border-kid-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-kid-primary">
            <Trophy className="h-6 w-6" />
            5-Week Drawing Challenge Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-kid-text">
                Completed: {completedCount}/{totalChallenges}
              </span>
              <span className="text-kid-text">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-kid-text/80">Complete all challenges to earn the 🏆 Challenge Champion badge!</p>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Challenges */}
      <div className="space-y-6">
        {weeklyData.map((week) => (
          <Card
            key={week.week}
            className={`${week.isUnlocked ? "bg-white border-kid-primary/20" : "bg-gray-50 border-gray-200"}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-3xl">{week.emoji}</span>
                  <div>
                    <div className="text-kid-primary">
                      Week {week.week}: {week.title}
                    </div>
                    <div className="text-sm text-kid-text/60 font-normal">
                      {week.completedCount}/{week.challenges.length} challenges completed
                    </div>
                  </div>
                </CardTitle>
                <div className="flex items-center gap-2">
                  {!week.isUnlocked && <Lock className="h-5 w-5 text-gray-400" />}
                  {week.completedCount === week.challenges.length && week.challenges.length > 0 && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Week Complete!
                    </Badge>
                  )}
                </div>
              </div>
              {week.challenges.length > 0 && (
                <Progress value={(week.completedCount / week.challenges.length) * 100} className="h-2" />
              )}
            </CardHeader>
            <CardContent>
              {!week.isUnlocked ? (
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">This week will unlock soon!</p>
                  <p className="text-sm text-gray-400">Complete previous weeks to unlock new challenges</p>
                </div>
              ) : week.challenges.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-kid-primary/50 mx-auto mb-3" />
                  <p className="text-kid-text">No challenges available for this week yet.</p>
                  <p className="text-sm text-kid-text/60">Check back soon for new challenges!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {week.challenges.map((challenge) => {
                    const completed = isCompleted(challenge.id)
                    const now = new Date()
                    const endDate = new Date(challenge.end_date)
                    const isExpired = now > endDate

                    return (
                      <Card
                        key={challenge.id}
                        className={`transition-all hover:shadow-md ${
                          completed
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-kid-primary/20 hover:border-kid-primary/40"
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base text-kid-primary line-clamp-2">{challenge.title}</CardTitle>
                            {completed && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                          </div>
                          <Badge
                            variant="secondary"
                            className={`${getDifficultyColor(challenge.difficulty_level)} text-white w-fit`}
                          >
                            {getDifficultyText(challenge.difficulty_level)}
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="bg-kid-accent/10 p-3 rounded-lg">
                            <p className="text-sm text-kid-text/80 italic line-clamp-3">"{challenge.prompt}"</p>
                          </div>

                          <Button
                            onClick={() => onStartChallenge(challenge)}
                            disabled={completed || isExpired}
                            size="sm"
                            className={`w-full ${
                              completed ? "bg-green-500 hover:bg-green-600" : "bg-kid-primary hover:bg-kid-primary/90"
                            } text-white`}
                          >
                            {completed ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Completed!
                              </>
                            ) : isExpired ? (
                              "Challenge Expired"
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-2" />
                                Start Challenge
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Active Challenges */}
      {weeklyData.every((week) => week.challenges.length === 0) && (
        <Card className="text-center p-8">
          <div className="text-6xl mb-4">🎯</div>
          <CardTitle className="text-2xl text-kid-primary mb-2">No Active Challenges</CardTitle>
          <CardDescription className="text-lg text-kid-text">
            Check back soon for new drawing challenges!
          </CardDescription>
        </Card>
      )}
    </div>
  )
}
