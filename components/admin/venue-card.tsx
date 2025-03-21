import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Venue } from "@/types/venue"

interface VenueCardProps {
  venue: Venue
}

export function VenueCard({ venue }: VenueCardProps) {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-video bg-muted relative overflow-hidden">
        <img
          src={venue.imageUrl || "/placeholder.svg?height=200&width=400"}
          alt={venue.name}
          className="object-cover w-full h-full"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{venue.name}</CardTitle>
        <CardDescription className="line-clamp-1">{venue.address}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between pt-0">
        {venue.website && (
          <Button variant="outline" size="sm" asChild className="gap-1">
            <a href={venue.website} target="_blank" rel="noopener noreferrer">
              Website <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
                  Edit
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit functionality coming soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  )
}

