"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [age, setAge] = useState("")
  const [parentEmail, setParentEmail] = useState("")
  const [isParent, setIsParent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!isParent && Number.parseInt(age) < 13 && !parentEmail) {
      setError("Parent email is required for children under 13")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          data: {
            username,
            display_name: displayName,
            age: Number.parseInt(age),
            parent_email: parentEmail,
            is_parent: isParent,
          },
        },
      })
      if (error) throw error
      router.push("/auth/signup-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kid-primary via-kid-secondary to-kid-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-kid-primary">Join the Fun!</CardTitle>
          <CardDescription className="text-lg text-kid-text">Create your account to start drawing</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-parent"
                checked={isParent}
                onCheckedChange={(checked) => setIsParent(checked as boolean)}
              />
              <Label htmlFor="is-parent" className="text-kid-text font-semibold">
                I am a parent/guardian
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-kid-text font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-lg border-2 border-kid-primary/20 focus:border-kid-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-kid-text font-semibold">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="coolartist123"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 text-lg border-2 border-kid-primary/20 focus:border-kid-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-kid-text font-semibold">
                Display Name
              </Label>
              <Input
                id="display-name"
                type="text"
                placeholder="Your Name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 text-lg border-2 border-kid-primary/20 focus:border-kid-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-kid-text font-semibold">
                Age
              </Label>
              <Select value={age} onValueChange={setAge} required>
                <SelectTrigger className="h-12 text-lg border-2 border-kid-primary/20 focus:border-kid-primary">
                  <SelectValue placeholder="Select your age" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 50 }, (_, i) => i + 5).map((ageOption) => (
                    <SelectItem key={ageOption} value={ageOption.toString()}>
                      {ageOption} years old
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isParent && Number.parseInt(age) < 13 && (
              <div className="space-y-2">
                <Label htmlFor="parent-email" className="text-kid-text font-semibold">
                  Parent/Guardian Email
                </Label>
                <Input
                  id="parent-email"
                  type="email"
                  placeholder="parent@email.com"
                  required
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="h-12 text-lg border-2 border-kid-primary/20 focus:border-kid-primary"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-kid-text font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-lg border-2 border-kid-primary/20 focus:border-kid-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-kid-text font-semibold">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 text-lg border-2 border-kid-primary/20 focus:border-kid-primary"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold bg-kid-primary hover:bg-kid-primary/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-kid-text">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-bold text-kid-primary hover:text-kid-primary/80 underline">
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
