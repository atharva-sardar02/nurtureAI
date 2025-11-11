/**
 * Landing Page (Public)
 * Public landing page with hero section and value proposition
 * Shown to unauthenticated users
 */

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/common/Layout"
import { useNavigate } from "react-router-dom"
import { Heart, Shield, Clock, MessageSquare } from "lucide-react"

export function Landing() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                Mental Health Support
                <br />
                <span className="text-primary">Made Simple</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                AI-powered assessment and streamlined onboarding to connect your child with the mental health care they need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="text-lg px-8"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="text-lg px-8"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose NurtureAI?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <Heart className="w-10 h-10 text-primary mb-4" />
                  <CardTitle>AI-Powered Assessment</CardTitle>
                  <CardDescription>
                    Get personalized mental health insights through our advanced AI assessment tool.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="w-10 h-10 text-primary mb-4" />
                  <CardTitle>Secure & Private</CardTitle>
                  <CardDescription>
                    Your data is protected with industry-standard security and 90-day retention policy.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="w-10 h-10 text-primary mb-4" />
                  <CardTitle>Quick Onboarding</CardTitle>
                  <CardDescription>
                    Streamlined process to get your child connected with care providers faster.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <MessageSquare className="w-10 h-10 text-primary mb-4" />
                  <CardTitle>Expert Support</CardTitle>
                  <CardDescription>
                    Connect with licensed mental health professionals who specialize in youth care.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join families who have found the support they need through NurtureAI.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="text-lg px-8"
            >
              Create Your Account
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  )
}

