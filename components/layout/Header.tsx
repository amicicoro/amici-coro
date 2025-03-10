"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="container mx-auto px-6 sm:px-8 md:px-12 py-8 md:py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl md:text-3xl font-playfair tracking-wide">
          AMICI CORO
        </Link>
        <button onClick={toggleMenu} className="md:hidden" aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <nav
          className={`${isMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row absolute md:relative top-20 left-0 right-0 bg-white md:bg-transparent z-50 md:top-0 p-4 md:p-0 shadow-md md:shadow-none gap-4 md:gap-6`}
        >
          {[
            ["Home", "/"],
            ["Events", "/events"],
            ["Past Events", "/past-events"],
            ["Venues", "/venues"],
            ["Join the Choir", "/join-the-choir"],
            ["Director of Music", "/director-of-music"],
          ].map(([title, url]) => (
            <Link
              key={url}
              href={url}
              className="text-gray-600 hover:text-primary transition-colors text-sm font-light"
            >
              {title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

