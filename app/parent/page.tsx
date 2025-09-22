"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Users, Shield, Activity, Calendar, Trophy, AlertTriangle, Settings, Download, Clock } from "lucide-react"
import Link from "next/link"

interface ChildAccount {
  id: string
  email: string
  age: number
  created_at: string
  last_active: string
}

interface ChildStats {
  drawing_count: number
  challenge_count: number
  badge_count: number
  time_spent_today: number
  consecutive_days: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  created_at: string
  child_id: string
}

interface PendingReport {
  id: string
  reason: string
  description: string
  drawing_title: string
  created_at: string
  status: string
}

export default function ParentDashboard() {
  const { user, loading } = useAuth()
  const [children, setChildren] = useState<ChildAccount[]>([])
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [childStats, setChildStats] = useState<ChildStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([])
  const [screenTimeSettings, setScreenTimeSettings] = useState({
    daily_limit: 60, // minutes
    break_reminder: 15, // minutes
    bedtime_mode: true,
    bedtime_start: "20:00",
    bedtime_end: "07:00",
  })

  useEffect(() => {
    if (!user) return

    const fetchParentData = async () => {
      const supabase = createClient()

      try {
        // Fetch child accounts linked to this parent
        const { data: childrenData, error: childrenError } = await supabase
          .from("users")
          .select("*")
          .eq("parent_email", user.email)
          .order("created_at", { ascending: false })

        if (childrenError) throw childrenError

        setChildren(childrenData || [])

        if (childrenData && childrenData.length > 0 && !selectedChild) {
          setSelectedChild(childrenData[0].id)
        }

        // Fetch pending reports for all children
        if (childrenData && childrenData.length > 0) {
          const childIds = childrenData.map((child) => child.id)

          const { data: reportsData, error: reportsError } = await supabase
            .from("reports")
            .select(`
              *,
              drawing:drawings(title)
            `)
            .in("drawing_id", childIds)
            .eq("status", "pending")

          if (!reportsError && reportsData) {
            setPendingReports(
              reportsData.map((report) => ({
                ...report,
                drawing_title: report.drawing?.title || "Unknown Drawing",
              })),
            )
          }
        }
      } catch (error) {
        console.error("Error fetching parent data:", error)
      }
    }

    fetchParentData()
  }, [user, selectedChild])

  useEffect(() => {
    if (!selectedChild) return

    const fetchChildStats = async () => {
      const supabase = createClient()

      try {
        // Fetch child's drawings
        const { data: drawingsData } = await supabase.from("drawings").select("created_at").eq("user_id", selectedChild)

        // Fetch child's challenge completions
        const { data: challengesData } = await supabase
          .from("challenge_completions")
          .select("completed_at")
          .eq("user_id", selectedChild)

        // Fetch child's badges
        const { data: badgesData } = await supabase.from("user_badges").select("earned_at").eq("user_id", selectedChild)

        // Fetch recent activity
        const { data: activityData } = await supabase
          .from("user_activity")
          .select("*")
          .eq("user_id", selectedChild)
          .order("created_at", { ascending: false })
          .limit(10)

        // Calculate stats
        const stats: ChildStats = {
          drawing_count: drawingsData?.length || 0,
          challenge_count: challengesData?.length || 0,
          badge_count: badgesData?.length || 0,
          time_spent_today: 45, // Placeholder - would track actual time
          consecutive_days: calculateConsecutiveDays(drawingsData || []),
        }

        setChildStats(stats)
        setRecentActivity(activityData || [])
      } catch (error) {
        console.error("Error fetching child stats:", error)
      }
    }

    fetchChildStats()
  }, [selectedChild])

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

  const handleScreenTimeUpdate = async (setting: string, value: any) => {
    try {
      const supabase = createClient()

      await supabase.from("parent_settings").upsert({
        parent_id: user.id,
        child_id: selectedChild,
        [setting]: value,
        updated_at: new Date().toISOString(),
      })

      setScreenTimeSettings((prev) => ({ ...prev, [setting]: value }))
    } catch (error) {
      console.error("Error updating screen time settings:", error)
    }
  }

  const handleReportAction = async (reportId: string, action: "approve" | "dismiss") => {
    try {
      const supabase = createClient()

      await supabase
        .from("reports")
        .update({
          status: action === "approve" ? "approved" : "dismissed",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", reportId)

      setPendingReports((prev) => prev.filter((report) => report.id !== reportId))
    } catch (error) {
      console.error("Error handling report:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <p className="text-2xl font-bold text-blue-600">Loading Parent Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Parent Dashboard</h1>
          <p className="text-lg text-gray-600 mb-6">Sign in to monitor your child's creative journey</p>
          <Button asChild className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  const selectedChildData = children.find((child) => child.id === selectedChild)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-blue-600 mb-2">Parent Dashboard</h1>
              <p className="text-lg text-gray-600">Monitor your child's creative journey and digital safety</p>
            </div>
            <Button asChild variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent">
              <Link href="/">Back to App</Link>
            </Button>
          </div>

          {/* Child Selector */}
          {children.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {children.map((child) => (
                <Button
                  key={child.id}
                  variant={selectedChild === child.id ? "default" : "outline"}
                  onClick={() => setSelectedChild(child.id)}
                  className={
                    selectedChild === child.id
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-blue-200 text-blue-600 hover:bg-blue-50"
                  }
                >
                  <Users className="h-4 w-4 mr-2" />
                  {child.email} (Age {child.age})
                </Button>
              ))}
            </div>
          )}
        </div>

        {children.length === 0 ? (
          <Card className="text-center p-8">
            <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
            <CardTitle className="text-2xl text-blue-600 mb-2">No Child Accounts Found</CardTitle>
            <CardDescription className="text-lg text-gray-600 mb-4">
              Child accounts will appear here when they sign up with your email as their parent contact.
            </CardDescription>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/auth/signup">Help Your Child Sign Up</Link>
            </Button>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-blue-200">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="safety" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Shield className="h-4 w-4 mr-2" />
                Safety
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Drawings Created</p>
                        <p className="text-2xl font-bold text-blue-600">{childStats?.drawing_count || 0}</p>
                      </div>
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Challenges Completed</p>
                        <p className="text-2xl font-bold text-green-600">{childStats?.challenge_count || 0}</p>
                      </div>
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                        <p className="text-2xl font-bold text-purple-600">{childStats?.badge_count || 0}</p>
                      </div>
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Time Today</p>
                        <p className="text-2xl font-bold text-orange-600">{childStats?.time_spent_today || 0}m</p>
                      </div>
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Trophy className="h-5 w-5" />
                    Creative Progress
                  </CardTitle>
                  <CardDescription>{selectedChildData?.email}'s artistic journey and achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Daily Drawing Streak</span>
                        <span className="font-medium">{childStats?.consecutive_days || 0} days</span>
                      </div>
                      <Progress value={Math.min((childStats?.consecutive_days || 0) * 10, 100)} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Screen Time Today</span>
                        <span className="font-medium">
                          {childStats?.time_spent_today || 0}/{screenTimeSettings.daily_limit} minutes
                        </span>
                      </div>
                      <Progress
                        value={((childStats?.time_spent_today || 0) / screenTimeSettings.daily_limit) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Calendar className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest actions and achievements from {selectedChildData?.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Activity className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No recent activity to show</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="safety" className="space-y-6">
              {/* Pending Reports */}
              {pendingReports.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-5 w-5" />
                      Pending Reports ({pendingReports.length})
                    </CardTitle>
                    <CardDescription>Content reports that require your review</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingReports.map((report) => (
                        <div key={report.id} className="bg-white p-4 rounded-lg border border-orange-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">"{report.drawing_title}"</p>
                              <p className="text-sm text-gray-600">Reason: {report.reason}</p>
                              {report.description && (
                                <p className="text-sm text-gray-500 mt-1">"{report.description}"</p>
                              )}
                            </div>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              {new Date(report.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReportAction(report.id, "approve")}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              Remove Content
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReportAction(report.id, "dismiss")}
                              className="border-green-200 text-green-600 hover:bg-green-50"
                            >
                              Keep Content
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Safety Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Shield className="h-5 w-5" />
                    Safety Overview
                  </CardTitle>
                  <CardDescription>
                    Current safety settings and protections for {selectedChildData?.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-green-800">Content Filtering</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-green-800">Safe Browsing</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-green-800">Parent Approval Required</span>
                        <Badge className="bg-green-100 text-green-800">Yes</Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-blue-800">Screen Time Monitoring</span>
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-blue-800">Activity Logging</span>
                        <Badge className="bg-blue-100 text-blue-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-blue-800">Direct Messages</span>
                        <Badge className="bg-red-100 text-red-800">Blocked</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Screen Time Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Clock className="h-5 w-5" />
                    Screen Time Controls
                  </CardTitle>
                  <CardDescription>
                    Manage daily limits and break reminders for {selectedChildData?.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Daily Time Limit</p>
                      <p className="text-sm text-gray-500">Maximum minutes per day</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={screenTimeSettings.daily_limit}
                        onChange={(e) => handleScreenTimeUpdate("daily_limit", Number.parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        min="15"
                        max="180"
                      />
                      <span className="text-sm text-gray-500">minutes</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Break Reminder</p>
                      <p className="text-sm text-gray-500">Remind to take breaks every</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={screenTimeSettings.break_reminder}
                        onChange={(e) => handleScreenTimeUpdate("break_reminder", Number.parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        min="5"
                        max="60"
                      />
                      <span className="text-sm text-gray-500">minutes</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Bedtime Mode</p>
                      <p className="text-sm text-gray-500">Restrict access during bedtime hours</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={screenTimeSettings.bedtime_mode}
                      onChange={(e) => handleScreenTimeUpdate("bedtime_mode", e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>

                  {screenTimeSettings.bedtime_mode && (
                    <div className="ml-4 space-y-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Bedtime Start</span>
                        <input
                          type="time"
                          value={screenTimeSettings.bedtime_start}
                          onChange={(e) => handleScreenTimeUpdate("bedtime_start", e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Bedtime End</span>
                        <input
                          type="time"
                          value={screenTimeSettings.bedtime_end}
                          onChange={(e) => handleScreenTimeUpdate("bedtime_end", e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Export Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Download className="h-5 w-5" />
                    Data Export
                  </CardTitle>
                  <CardDescription>Download your child's artwork and activity data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Export Artwork
                    </Button>
                    <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Export Activity Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
