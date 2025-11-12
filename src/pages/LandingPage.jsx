/**
 * Landing Page
 * Welcoming page displayed after authentication
 * Makes users feel comfortable and guides them to take the assessment
 */

import { useNavigate } from "react-router-dom"
import { Header } from "@/components/common/Header"
import { Footer } from "@/components/common/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Sparkles, Shield, ArrowRight, CheckCircle2 } from "lucide-react"

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Welcome Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              {/* Welcome Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Heart className="w-10 h-10 text-primary" />
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                Welcome to NurtureAI
              </h1>
              
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4">
                We're here to support you and your family on your mental health journey.
              </p>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Take a moment. You're in a safe, judgment-free space where your concerns matter.
              </p>
            </div>

            {/* Comforting Message Card */}
            <Card className="border-primary/20 bg-primary/5 mb-12">
              <CardContent className="pt-8 pb-8">
                <div className="max-w-2xl mx-auto text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-semibold">You're Taking the Right Step</h2>
                  </div>
                  
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    Every family's journey is unique, and seeking support is a sign of strength. 
                    Our AI-powered assessment is designed to understand your child's needs in a 
                    compassionate, confidential way.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 pt-6 border-t border-primary/10">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>Completely Confidential</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>No Judgment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>Secure & Private</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl font-semibold">
                  Ready to Begin?
                </h3>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Our assessment will help us understand your child's needs and connect you with 
                  the right support. It only takes a few minutes.
                </p>
              </div>
              
              <Button
                size="lg"
                onClick={() => navigate("/chat")}
                className="text-lg px-8 py-6 h-auto min-h-[56px] text-base sm:text-lg font-semibold"
              >
                <Heart className="w-5 h-5 mr-2" />
                Take Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <p className="text-sm text-muted-foreground pt-2">
                This assessment is completely confidential and will help us personalize your experience.
              </p>
            </div>
          </div>
        </section>

        {/* Reassurance Section */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold">Your Privacy Matters</h4>
                <p className="text-sm text-muted-foreground">
                  All information is encrypted and stored securely. We respect your privacy.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold">Compassionate Care</h4>
                <p className="text-sm text-muted-foreground">
                  Our team understands that every family's situation is unique and deserves empathy.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold">Personalized Support</h4>
                <p className="text-sm text-muted-foreground">
                  We'll match you with clinicians who understand your child's specific needs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

