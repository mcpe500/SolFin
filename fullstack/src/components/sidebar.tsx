"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Home, 
  Wallet, 
  PiggyBank, 
  TrendingUp, 
  Target, 
  Calendar,
  MapPin,
  Mic,
  Camera,
  Settings,
  HelpCircle
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/",
    icon: Home,
  },
  {
    title: "Accounts",
    href: "/accounts",
    icon: Wallet,
  },
  {
    title: "Pouches",
    href: "/pouches",
    icon: PiggyBank,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: TrendingUp,
  },
  {
    title: "Goals",
    href: "/goals",
    icon: Target,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Spending Map",
    href: "/map",
    icon: MapPin,
  },
  {
    title: "Voice Entry",
    href: "/voice",
    icon: Mic,
  },
  {
    title: "Receipt Scan",
    href: "/scan",
    icon: Camera,
  },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6">
            <h2 className="text-lg font-semibold">SolFin</h2>
          </div>
          <div className="space-y-1">
            {sidebarNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "transparent"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Link
              href="/settings"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
            <Link
              href="/help"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}