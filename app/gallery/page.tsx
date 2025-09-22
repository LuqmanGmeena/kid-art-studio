"use client"
import { useAuth } from "@/components/auth-provider"
import { PublicGallery } from "@/components/public-gallery"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Trophy, Calendar, Users } from "lucide-react"
import Link from "next/link"

export default function CommunityGallery() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <p className="text-2xl font-bold text-primary">Loading Community Gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              asChild
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 bg-transparent"
            >
              <Link href="/">← Back to Studio</Link>
            </Button>
            {!user && (
              <Button asChild className="bg-primary hover:bg-primary/90 text-white">
                <Link href="/auth/login">Sign In to Like & Share</Link>
              </Button>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">🌟 Community Gallery</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Discover amazing artwork created by young artists from around the world!
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-4 text-center">
                <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary">1,234</p>
                <p className="text-xs text-muted-foreground">Young Artists</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-4 text-center">
                <Calendar className="h-6 w-6 text-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold text-secondary">5,678</p>
                <p className="text-xs text-muted-foreground">Artworks Shared</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-4 text-center">
                <Trophy className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-accent">892</p>
                <p className="text-xs text-muted-foreground">Challenge Entries</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-4 text-center">
                <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">156</p>
                <p className="text-xs text-muted-foreground">Featured Works</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gallery Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              All Artwork
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Star className="h-4 w-4 mr-2" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="challenges" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Trophy className="h-4 w-4 mr-2" />
              Challenges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-primary">All Community Artwork</CardTitle>
                <CardDescription>Browse through amazing creations from young artists of all ages</CardDescription>
              </CardHeader>
            </Card>
            <PublicGallery />
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-yellow-700">
                  <Star className="h-6 w-6" />
                  Featured Artwork
                </CardTitle>
                <CardDescription className="text-yellow-600">
                  Exceptional artwork selected by our community moderators
                </CardDescription>
              </CardHeader>
            </Card>
            <PublicGallery showFeatured={true} />
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-primary">
                  <Trophy className="h-6 w-6" />
                  Challenge Entries
                </CardTitle>
                <CardDescription className="text-primary/80">
                  Creative responses to our weekly drawing challenges
                </CardDescription>
              </CardHeader>
            </Card>
            <PublicGallery />
          </TabsContent>
        </Tabs>

        {/* Safety Notice */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-blue-800 mb-2">Safe & Moderated Community</h3>
              <p className="text-sm text-blue-700">
                All artwork is reviewed by our moderation team to ensure a safe, positive environment for young artists.
                If you see anything concerning, please report it to help us maintain our community standards.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
