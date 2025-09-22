"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Search, Filter, Eye, Calendar, Trophy, Star } from "lucide-react"
import { ReportModal, ContentFilter } from "@/components/moderation-tools"
import { cn } from "@/lib/utils"

interface PublicDrawing {
  id: string
  title: string
  thumbnail_url: string
  canvas_data: string
  created_at: string
  user_id: string
  user_age: number
  challenge_id?: string
  challenge_title?: string
  like_count: number
  is_featured: boolean
  moderation_status: "approved" | "pending" | "rejected"
}

interface PublicGalleryProps {
  showFeatured?: boolean
  challengeId?: string
}

export function PublicGallery({ showFeatured = false, challengeId }: PublicGalleryProps) {
  const { user } = useAuth()
  const [drawings, setDrawings] = useState<PublicDrawing[]>([])
  const [filteredDrawings, setFilteredDrawings] = useState<PublicDrawing[]>([])
  const [selectedDrawing, setSelectedDrawing] = useState<PublicDrawing | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [ageFilter, setAgeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [likedDrawings, setLikedDrawings] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchDrawings()
    if (user) {
      fetchUserLikes()
    }
  }, [user, showFeatured, challengeId])

  useEffect(() => {
    filterAndSortDrawings()
  }, [drawings, searchTerm, ageFilter, sortBy])

  const fetchDrawings = async () => {
    const supabase = createClient()

    try {
      let query = supabase
        .from("drawings")
        .select(`
          *,
          users!inner(age),
          challenges(title),
          drawing_likes(count)
        `)
        .eq("is_public", true)
        .eq("moderation_status", "approved")

      if (showFeatured) {
        query = query.eq("is_featured", true)
      }

      if (challengeId) {
        query = query.eq("challenge_id", challengeId)
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(50)

      if (error) throw error

      const processedDrawings: PublicDrawing[] = (data || []).map((drawing) => ({
        id: drawing.id,
        title: drawing.title,
        thumbnail_url: drawing.thumbnail_url,
        canvas_data: drawing.canvas_data,
        created_at: drawing.created_at,
        user_id: drawing.user_id,
        user_age: drawing.users?.age || 0,
        challenge_id: drawing.challenge_id,
        challenge_title: drawing.challenges?.title,
        like_count: drawing.drawing_likes?.length || 0,
        is_featured: drawing.is_featured,
        moderation_status: drawing.moderation_status,
      }))

      setDrawings(processedDrawings)
    } catch (error) {
      console.error("Error fetching public drawings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserLikes = async () => {
    if (!user) return

    const supabase = createClient()

    try {
      const { data, error } = await supabase.from("drawing_likes").select("drawing_id").eq("user_id", user.id)

      if (error) throw error

      setLikedDrawings(new Set(data?.map((like) => like.drawing_id) || []))
    } catch (error) {
      console.error("Error fetching user likes:", error)
    }
  }

  const filterAndSortDrawings = () => {
    let filtered = [...drawings]

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (drawing) =>
          drawing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          drawing.challenge_title?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply age filter
    if (ageFilter !== "all") {
      const ageRange = ageFilter.split("-").map(Number)
      filtered = filtered.filter((drawing) => {
        if (ageRange.length === 2) {
          return drawing.user_age >= ageRange[0] && drawing.user_age <= ageRange[1]
        }
        return drawing.user_age >= ageRange[0]
      })
    }

    // Apply sorting
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.like_count - a.like_count)
        break
      case "recent":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "featured":
        filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
        break
    }

    setFilteredDrawings(filtered)
  }

  const handleLike = async (drawingId: string) => {
    if (!user) return

    const supabase = createClient()
    const isLiked = likedDrawings.has(drawingId)

    try {
      if (isLiked) {
        await supabase.from("drawing_likes").delete().eq("user_id", user.id).eq("drawing_id", drawingId)

        setLikedDrawings((prev) => {
          const newSet = new Set(prev)
          newSet.delete(drawingId)
          return newSet
        })

        setDrawings((prev) =>
          prev.map((drawing) =>
            drawing.id === drawingId ? { ...drawing, like_count: drawing.like_count - 1 } : drawing,
          ),
        )
      } else {
        await supabase.from("drawing_likes").insert({ user_id: user.id, drawing_id: drawingId })

        setLikedDrawings((prev) => new Set([...prev, drawingId]))

        setDrawings((prev) =>
          prev.map((drawing) =>
            drawing.id === drawingId ? { ...drawing, like_count: drawing.like_count + 1 } : drawing,
          ),
        )
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleReportSubmitted = () => {
    // Refresh the gallery or show success message
    fetchDrawings()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getAgeGroupLabel = (age: number) => {
    if (age <= 7) return "Little Artist"
    if (age <= 10) return "Young Creator"
    if (age <= 13) return "Teen Artist"
    return "Artist"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-2">🎨</div>
          <p className="text-lg text-kid-text">Loading amazing artwork...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search artwork or challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Age Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="5-7">Ages 5-7</SelectItem>
                  <SelectItem value="8-10">Ages 8-10</SelectItem>
                  <SelectItem value="11-13">Ages 11-13</SelectItem>
                  <SelectItem value="14-17">Ages 14-17</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredDrawings.map((drawing) => (
          <ContentFilter key={drawing.id} drawingData={drawing.canvas_data}>
            <Card
              className={cn(
                "overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 bg-white/90 backdrop-blur-sm",
                selectedDrawing?.id === drawing.id && "ring-2 ring-kid-primary shadow-lg scale-105",
                drawing.is_featured && "ring-2 ring-yellow-400",
              )}
              onClick={() => setSelectedDrawing(drawing)}
            >
              <CardContent className="p-0">
                <div className="aspect-square relative bg-white">
                  <img
                    src={drawing.thumbnail_url || "/placeholder.svg"}
                    alt={drawing.title}
                    className="w-full h-full object-contain"
                  />

                  {/* Featured Badge */}
                  {drawing.is_featured && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-400 text-yellow-900 text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* Challenge Badge */}
                  {drawing.challenge_title && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-kid-primary/10 text-kid-primary text-xs">
                        <Trophy className="h-3 w-3 mr-1" />
                        Challenge
                      </Badge>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                    <Eye className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="font-medium text-sm truncate mb-1">{drawing.title}</h4>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{getAgeGroupLabel(drawing.user_age)}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{drawing.like_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(drawing.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ContentFilter>
        ))}
      </div>

      {filteredDrawings.length === 0 && (
        <Card className="text-center p-8">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-2xl font-bold text-kid-primary mb-2">No Artwork Found</h3>
          <p className="text-kid-text">
            {searchTerm || ageFilter !== "all"
              ? "Try adjusting your search or filters to see more artwork."
              : "Be the first to share your amazing artwork with the community!"}
          </p>
        </Card>
      )}

      {/* Selected Drawing Modal */}
      {selectedDrawing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Large Preview */}
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <img
                      src={selectedDrawing.canvas_data || "/placeholder.svg"}
                      alt={selectedDrawing.title}
                      className="w-full h-auto max-h-96 object-contain mx-auto"
                    />
                  </div>
                </div>

                {/* Drawing Info and Actions */}
                <div className="lg:w-80 space-y-4">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-kid-primary">{selectedDrawing.title}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDrawing(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-kid-secondary/10 text-kid-secondary">
                          {getAgeGroupLabel(selectedDrawing.user_age)}
                        </Badge>
                        {selectedDrawing.is_featured && (
                          <Badge className="bg-yellow-400 text-yellow-900">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>

                      {selectedDrawing.challenge_title && (
                        <div className="bg-kid-primary/10 p-3 rounded-lg">
                          <p className="text-sm font-medium text-kid-primary mb-1">Challenge Entry:</p>
                          <p className="text-sm text-kid-text">{selectedDrawing.challenge_title}</p>
                        </div>
                      )}

                      <p className="text-sm text-gray-500">Created on {formatDate(selectedDrawing.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {user && (
                      <Button
                        onClick={() => handleLike(selectedDrawing.id)}
                        variant={likedDrawings.has(selectedDrawing.id) ? "default" : "outline"}
                        className={cn(
                          "w-full",
                          likedDrawings.has(selectedDrawing.id)
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "border-red-200 text-red-600 hover:bg-red-50 bg-transparent",
                        )}
                      >
                        <Heart
                          className={cn("h-4 w-4 mr-2", likedDrawings.has(selectedDrawing.id) && "fill-current")}
                        />
                        {likedDrawings.has(selectedDrawing.id) ? "Liked" : "Like"} ({selectedDrawing.like_count})
                      </Button>
                    )}

                    {user && user.id !== selectedDrawing.user_id && (
                      <ReportModal
                        drawingId={selectedDrawing.id}
                        drawingTitle={selectedDrawing.title}
                        onReportSubmitted={handleReportSubmitted}
                      />
                    )}
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Community Guidelines:</p>
                    <p>
                      This artwork has been reviewed and approved by our moderation team to ensure it's appropriate for
                      all ages.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
