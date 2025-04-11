"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, Settings, LogOut } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const navItems = [
    // { name: "Home", href: "/" },
    // { name: "About", href: "/about" },
    // { name: "How It Works", href: "/#how-it-works" },
  ]

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">TrustIt AI</span>
          </Link>

          {/* Desktop Navigation 
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href) ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>*/}

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <User className="h-5 w-5 mr-1" />
                    <span className="max-w-[100px] truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-3">
              {/*
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium py-2 ${isActive(item.href) ? "text-blue-600" : "text-gray-600"}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              */}
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium py-2 text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="text-sm font-medium py-2 text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    className="text-sm font-medium py-2 text-red-600 text-left"
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium py-2 text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm font-medium py-2 text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
