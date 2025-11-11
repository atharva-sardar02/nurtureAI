/**
 * Alternative Resources Component
 * Displays alternative mental health resources when child is not a fit
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen, Users, Heart } from "lucide-react"

const ALTERNATIVE_RESOURCES = [
  {
    name: "National Alliance on Mental Illness (NAMI)",
    description: "Support groups, education, and resources for families",
    url: "https://www.nami.org/",
    icon: Users,
  },
  {
    name: "Mental Health America",
    description: "Screening tools and educational resources",
    url: "https://www.mhanational.org/",
    icon: Heart,
  },
  {
    name: "Child Mind Institute",
    description: "Evidence-based resources for child mental health",
    url: "https://childmind.org/",
    icon: BookOpen,
  },
]

export function AlternativeResources({ onContinue }) {
  return (
    <Card className="mb-4 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Alternative Resources
        </CardTitle>
        <CardDescription>
          While our services may not be the best fit right now, here are some
          excellent resources that might help:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {ALTERNATIVE_RESOURCES.map((resource) => {
          const Icon = resource.icon
          return (
            <div
              key={resource.name}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{resource.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {resource.description}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="text-xs"
                >
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Visit Resource
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </div>
          )
        })}

        {onContinue && (
          <Button
            variant="default"
            onClick={onContinue}
            className="w-full mt-4"
          >
            Continue to Onboarding Anyway
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

