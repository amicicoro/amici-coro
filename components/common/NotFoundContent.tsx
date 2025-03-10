import Link from "next/link"
import { Button } from "@/components/ui/Button"

interface NotFoundContentProps {
  title?: string
  message?: string
  buttonText?: string
  buttonHref?: string
}

export function NotFoundContent({
  title = "404 - Page Not Found",
  message = "We're sorry, but the page you're looking for doesn't exist or has been moved.",
  buttonText = "Return to Homepage",
  buttonHref = "/",
}: NotFoundContentProps) {
  return (
    <div className="container mx-auto px-6 sm:px-8 md:px-12 py-12 text-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair mb-6">{title}</h1>
      <p className="text-lg md:text-xl mb-8 text-gray-600">{message}</p>
      <Link href={buttonHref}>
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
          {buttonText}
        </Button>
      </Link>
    </div>
  )
}

