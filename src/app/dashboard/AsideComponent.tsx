import React from 'react';
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Home, LineChart, Package, Settings, Users2, MessageSquare, Mail } from "lucide-react"

export function AsideComponent({ onViewChange, currentView }: { onViewChange: (view: 'users' | 'chat' | 'email') => void, currentView: 'users' | 'chat' | 'email' }) {
  return <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
    <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
      <Link
        href="#"
        onClick={() => onViewChange('users')}
        className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full ${currentView === 'users' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'} text-lg font-semibold md:h-8 md:w-8 md:text-base`}
      >
        <Home className="h-4 w-4 transition-all group-hover:scale-110" />
        <span className="sr-only">Users</span>
      </Link>

      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            onClick={() => onViewChange('chat')}
            className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full ${currentView === 'chat' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'} text-lg font-semibold md:h-8 md:w-8 md:text-base`}
          >
            <MessageSquare className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">AI Chat</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">AI Chat</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            onClick={() => onViewChange('email')}
            className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full ${currentView === 'email' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'} text-lg font-semibold md:h-8 md:w-8 md:text-base`}
          >
            <Mail className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Email</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Email</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Package className="h-5 w-5" />
            <span className="sr-only">Products</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Products</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Users2 className="h-5 w-5" />
            <span className="sr-only">Customers</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Customers</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <LineChart className="h-5 w-5" />
            <span className="sr-only">Analytics</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Analytics</TooltipContent>
      </Tooltip>
    </nav>
    <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Settings</TooltipContent>
      </Tooltip>
    </nav>
  </aside>
}