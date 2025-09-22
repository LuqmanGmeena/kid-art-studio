"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Award, Lock } from "lucide-react"

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  criteria: {
    type: string
    value: number
  }
  created_at: string
}

interface UserBadge {
  id: string
  badge_id: string
  earned_at: string
  badge: BadgeData
}

interface UserStats {
  drawing_count: number
  challenge_count: number
  consecutive_days: number
  color_variety: number
}

export function Badges() {
  const { user } = useAuth()
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    drawing_count: 0,
    challenge_count: 0,
    consecutive_days: 0,
    color_variety: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchBadgesAndProgress = async () => {
      const supabase = createClient()

      try {
        // Fetch all available badges
        const { data: badgesData, error: badgesError } = await supabase
          .from("badges")
          .select("*")
          .order("created_at", { ascending: true })

        if (badgesError) throw badgesError

        // Fetch user's earned badges
        const { data: userBadgesData, error: userBadgesError } = await supabase
          .from("user_badges")
          .select(`
            *,
            badge:badges(*)
          `)
          .eq("user_id", user.id)

        if (userBadgesError) throw userBadgesError

        // Fetch user statistics
        const { data: drawingsData } = await supabase.from("drawings").select("created_at").eq("user_id", user.id)

        const { data: challengesData } = await supabase
          .from("challenge_completions")
          .select("completed_at")
          .eq("user_id", user.id)

        // Calculate stats
        const stats: UserStats = {
          drawing_count: drawingsData?.length || 0,
          challenge_count: challengesData?.length || 0,
          consecutive_days: calculateConsecutiveDays(drawingsData || []),
          color_variety: 10, // Placeholder - would need to analyze canvas data
        }

        setBadges(badgesData || [])
        setUserBadges(userBadgesData || [])
        setUserStats(stats)

        // Check for new badges to award
        await checkAndAwardBadges(supabase, badgesData || [], userBadgesData || [], stats)
      } catch (error) {
        console.error("Error fetching badges:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBadgesAndProgress()
  }, [user])

  const calculateConsecutiveDays = (drawings: Array<{ created_at: string }>) => {
    if (drawings.length === 0) return 0

    const dates = drawings
      .map((d) => new Date(d.created_at).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let consecutive = 1
    const today = new Date().toDateString()

    if (dates[0] !== today) return 0

    for (let i = 1; i < dates.length; i++) {
      const current = new Date(dates[i - 1])
      const previous = new Date(dates[i])
      const diffTime = current.getTime() - previous.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      if (diffDays === 1) {
        consecutive++
      } else {
        break
      }
    }

    return consecutive
  }

  const checkAndAwardBadges = async (
    supabase: any,
    allBadges: BadgeData[],
    earnedBadges: UserBadge[],
    stats: UserStats,
  ) => {
    const earnedBadgeIds = earnedBadges.map((ub) => ub.badge_id)

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue

      let shouldAward = false

      switch (badge.criteria.type) {
        case "drawing_count":
          shouldAward = stats.drawing_count >= badge.criteria.value
          break
        case "challenge_count":
          shouldAward = stats.challenge_count >= badge.criteria.value
          break
        case "consecutive_days":
          shouldAward = stats.consecutive_days >= badge.criteria.value
          break
        case "color_variety":
          shouldAward = stats.color_variety >= badge.criteria.value
          break
      }

      if (shouldAward) {
        try {
          await supabase.from("user_badges").insert({
            user_id: user.id,
            badge_id: badge.id,
          })

          // Update local state
          setUserBadges((prev) => [
            ...prev,
            {
              id: `new-${badge.id}`,
              badge_id: badge.id,
              earned_at: new Date().toISOString(),
              badge: badge,
            },
          ])

          // Show celebration (you could add a toast notification here)
          console.log(`New badge earned: ${badge.name}!`)
        } catch (error) {
          console.error("Error awarding badge:", error)
        }
      }
    }
  }

  const isBadgeEarned = (badgeId: string) => {
    return userBadges.some((ub) => ub.badge_id === badgeId)
  }

  const getBadgeProgress = (badge: BadgeData) => {
    let current = 0
    const target = badge.criteria.value

    switch (badge.criteria.type) {
      case "drawing_count":
        current = userStats.drawing_count
        break
      case "challenge_count":
        current = userStats.challenge_count
        break
      case "consecutive_days":
        current = userStats.consecutive_days
        break
      case "color_variety":
        current = userStats.color_variety
        break
    }

    return {
      current: Math.min(current, target),
      target,
      percentage: Math.min((current / target) * 100, 100),
    }
  }

  const getProgressText = (badge: BadgeData) => {
    const progress = getBadgeProgress(badge)

    switch (badge.criteria.type) {
      case "drawing_count":
        return `${progress.current}/${progress.target} drawings`
      case "challenge_count":
        return `${progress.current}/${progress.target} challenges`
      case "consecutive_days":
        return `${progress.current}/${progress.target} days`
      case "color_variety":
        return `${progress.current}/${progress.target} colors`
      default:
        return `${progress.current}/${progress.target}`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-lg text-kid-text">Loading badges...</p>
        </div>
      </div>
    )
  }

  const earnedBadgesCount = userBadges.length
  const totalBadges = badges.length

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-kid-accent/10 to-kid-primary/10 border-kid-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-kid-primary">
            <Trophy className="h-6 w-6" />
            Badge Collection
          </CardTitle>
          <CardDescription className="text-kid-text">
            Earn badges by completing drawings and challenges!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-kid-text">
                Earned: {earnedBadgesCount}/{totalBadges}
              </span>
              <span className="text-kid-text">
                {totalBadges > 0 ? Math.round((earnedBadgesCount / totalBadges) * 100) : 0}%
              </span>
            </div>
            <Progress value={totalBadges > 0 ? (earnedBadgesCount / totalBadges) * 100 : 0} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-kid-primary">{userStats.drawing_count}</div>
            <p className="text-sm text-kid-text">Drawings</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-kid-secondary">{userStats.challenge_count}</div>
            <p className="text-sm text-kid-text">Challenges</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-kid-accent">{userStats.consecutive_days}</div>
            <p className="text-sm text-kid-text">Day Streak</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-500">{earnedBadgesCount}</div>
            <p className="text-sm text-kid-text">Badges</p>
          </CardContent>
        </Card>
      </div>

      {/* Badges Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => {
          const earned = isBadgeEarned(badge.id)
          const progress = getBadgeProgress(badge)
          const earnedBadge = userBadges.find((ub) => ub.badge_id === badge.id)

          return (
            <Card
              key={badge.id}
              className={`transition-all ${
                earned
                  ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl ${earned ? "" : "grayscale opacity-50"}`}>{badge.icon}</div>
                    <div>
                      <CardTitle className={`text-lg ${earned ? "text-kid-primary" : "text-gray-500"}`}>
                        {badge.name}
                      </CardTitle>
                      {earned && earnedBadge && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                          Earned {new Date(earnedBadge.earned_at).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {earned ? <Award className="h-6 w-6 text-yellow-500" /> : <Lock className="h-6 w-6 text-gray-400" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className={earned ? "text-kid-text" : "text-gray-500"}>
                  {badge.description}
                </CardDescription>

                {!earned && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-600">{getProgressText(badge)}</span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                  </div>
                )}

                {earned && (
                  <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
                    <Star className="h-4 w-4" />
                    <span className="font-medium">Badge Earned!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {badges.length === 0 && (
        <Card className="text-center p-8">
          <div className="text-6xl mb-4">🏆</div>
          <CardTitle className="text-2xl text-kid-primary mb-2">No Badges Available</CardTitle>
          <CardDescription className="text-lg text-kid-text">
            Badges will appear here as they become available!
          </CardDescription>
        </Card>
      )}
    </div>
  )
}
