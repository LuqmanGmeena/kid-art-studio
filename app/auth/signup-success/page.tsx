import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kid-primary via-kid-secondary to-kid-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-kid-primary">Welcome to Kid Art Studio!</CardTitle>
          <CardDescription className="text-lg text-kid-text">Check your email to confirm your account</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-kid-text">
            We've sent you a confirmation email. Please check your inbox and click the link to activate your account.
          </p>
          <div className="text-6xl">🎨</div>
          <Button asChild className="bg-kid-primary hover:bg-kid-primary/90 text-white">
            <Link href="/auth/login">Back to Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
