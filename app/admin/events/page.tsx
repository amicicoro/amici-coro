import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllEvents } from "@/lib/events-data"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default async function EventsAdminPage() {
  const events = await getAllEvents()

  return (
    <div className="container max-w-5xl py-12">
      <div className="flex justify-between items-center mb-8 px-4">
        <h1 className="text-4xl font-bold">Events</h1>
        <Link href="/admin/events/create">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" /> Create Event
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 px-4">
        {events.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="pt-10 pb-10">
              <p className="text-center text-muted-foreground text-lg">No events found. Create your first event!</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3 pt-6 px-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">{event.title}</CardTitle>
                    {event.subtitle && <p className="text-sm text-muted-foreground">{event.subtitle}</p>}
                    <CardDescription className="text-base mt-2">
                      {format(new Date(event.date), "PPP")}
                      {event.date !== event.endDate && ` - ${format(new Date(event.endDate), "PPP")}`}
                    </CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button variant="outline" disabled className="cursor-not-allowed">
                            <span className="flex items-center">Edit</span>
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit functionality coming soon</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {event.description || "No description provided"}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span
                    className={`mr-2 h-3 w-3 rounded-full ${
                      new Date(event.endDate) >= new Date() ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  {new Date(event.endDate) >= new Date() ? "Upcoming" : "Past"}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

