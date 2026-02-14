'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { TokenWarning } from '@/components/token-warning'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ChevronDown, FileText, Layout, LogOut, Menu, Shield, Sparkles, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Bosh sahifa', icon: Sparkles },
  { href: '/resume/builder', label: 'Rezyume yaratish', icon: Sparkles },
  { href: '/resumes', label: 'Rezyumelar', icon: FileText },
  { href: '/templates', label: 'Shablonlar', icon: Layout },
] as const

const profileNavLink = { href: '/profile', label: 'Profil', icon: User } as const

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="border-b border-border/60 bg-card/70 backdrop-blur-md sticky top-0 z-50 w-full">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        {/* Logo — responsive: truncate on very small */}
        <Link
          href="/"
          className={cn(
            'font-display font-semibold text-foreground tracking-tight hover:text-primary transition-colors shrink-0 min-w-0',
            'text-base sm:text-lg lg:text-xl max-w-[140px] sm:max-w-none truncate sm:truncate-none',
          )}
          title="AI Rezyume"
        >
          AI Rezyume
        </Link>

        {/* Desktop nav — from lg (1024px): pill links; mobile/tablet use sheet */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center min-w-0">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'inline-flex items-center gap-1.5 xl:gap-2 rounded-full border px-2.5 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-transparent bg-transparent text-muted-foreground hover:border-primary/40 hover:bg-accent/50 hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop (lg+): token warning + theme + auth */}
        <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0 min-w-0">
          <TokenWarning />
          <ThemeToggle />
          {user ? (
            <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <DropdownMenuTrigger asChild>
                <motion.button
                  type="button"
                  className="flex items-center gap-2 xl:gap-3 rounded-full border border-border/80 bg-card/80 pl-1.5 pr-2 xl:pl-2 xl:pr-3 py-1.5 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer min-w-0 max-w-[160px] xl:max-w-[220px]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Foydalanuvchi menyusi"
                >
                  <Avatar className="h-7 w-7 xl:h-8 xl:w-8 shrink-0 ring-2 ring-background">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                    <AvatarFallback className="text-xs xl:text-sm font-medium bg-primary/10 text-primary">
                      {user.name?.[0] ?? user.email[0]?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-xs xl:text-sm font-medium text-foreground">
                    {user.name || user.email}
                  </span>
                  <motion.span
                    animate={{ rotate: userMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="shrink-0 text-muted-foreground"
                  >
                    <ChevronDown className="h-3.5 w-3.5 xl:h-4 xl:w-4" aria-hidden />
                  </motion.span>
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/80 shadow-lg" sideOffset={8}>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/resumes" className="cursor-pointer flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Mening rezyumelarim
                  </Link>
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full text-xs xl:text-sm">
                <Link href="/login">Kirish</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full text-xs xl:text-sm">
                <Link href="/register">Ro‘yxatdan o‘tish</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile + Tablet: token warning + theme + hamburger */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
          <TokenWarning />
          <ThemeToggle />
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg sm:rounded-xl h-9 w-9 sm:h-10 sm:w-10 shrink-0"
                aria-label="Menyu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex flex-col p-0 w-full max-w-[min(20rem,85vw)] sm:max-w-[22rem]"
            >
              <motion.div
                className="flex flex-col flex-1 overflow-auto"
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
                  closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
                }}
              >
                <SheetHeader className="p-6 pb-4 text-left">
                  <motion.div
                    variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -12 } }}
                    transition={{ duration: 0.25 }}
                  >
                    <SheetTitle className="font-display">Menyu</SheetTitle>
                  </motion.div>
                </SheetHeader>
                <nav className="flex flex-col gap-0.5 px-4">
                  {navLinks.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
                    return (
                      <motion.div key={href} variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: 16 } }} transition={{ duration: 0.25 }}>
                        <Link
                          href={href}
                          onClick={() => setSheetOpen(false)}
                          className={cn(
                            'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                            isActive ? 'text-primary bg-primary/10' : 'text-foreground hover:bg-accent',
                          )}
                        >
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          {label}
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>
                <Separator className="my-2" />
                <motion.div
                  className="flex flex-col gap-1.5 px-4 py-2"
                  variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: 16 } }}
                  transition={{ duration: 0.25, delay: 0.2 }}
                >
                  {user ? (
                    <>
                      <p className="px-4 py-2 text-xs text-muted-foreground truncate">{user.email}</p>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="justify-start"
                        onClick={() => setSheetOpen(false)}
                      >
                        <Link href={profileNavLink.href} className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {profileNavLink.label}
                        </Link>
                      </Button>
                      {user.isAdmin && (
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="justify-start"
                          onClick={() => setSheetOpen(false)}
                        >
                          <Link href="/admin" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admin
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          logout()
                          setSheetOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Chiqish
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-xl w-full justify-center"
                        onClick={() => setSheetOpen(false)}
                      >
                        <Link href="/login">Kirish</Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="rounded-xl w-full justify-center"
                        onClick={() => setSheetOpen(false)}
                      >
                        <Link href="/register">Ro‘yxatdan o‘tish</Link>
                      </Button>
                    </>
                  )}
                </motion.div>
              </motion.div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
