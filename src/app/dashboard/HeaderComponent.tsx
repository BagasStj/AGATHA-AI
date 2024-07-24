import React, { useState } from 'react';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Home, MessageSquare, PanelLeft, Search, User, Users2, X } from "lucide-react"

interface HeaderComponentProps {
  currentUser: any;
  onLogout: () => void;
  currentView: 'users' | 'chat';
  onViewChange: (view: 'users' | 'chat') => void;
}

export function HeaderComponent({ currentUser, onLogout, currentView, onViewChange }: HeaderComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleViewChange = (view: 'users' | 'chat') => {
    onViewChange(view);
    setIsOpen(false);
  };
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm sm:px-6">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:max-w-none">
          <SheetHeader className="border-b pb-4 mb-4">
            <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
          </SheetHeader>
          <nav className="space-y-4" aria-label="Main Navigation">
            {['users', 'chat'].map((view) => (
              <Link
                key={view}
                href="#"
                onClick={() => handleViewChange(view as 'users' | 'chat')}
                className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
                  currentView === view 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {view === 'users' ? <Users2 className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Link>
            ))}
          </nav>
          <Button onClick={() => setIsOpen(false)}  className="absolute top-4 right-4">
            <X className="h-4 w-4" />
          </Button>
        </SheetContent>
      </Sheet>
      
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="#" onClick={() => onViewChange('users')} className="text-gray-600 hover:text-gray-900">Users</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {currentView === 'chat' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#" onClick={() => onViewChange('chat')} className="text-gray-600 hover:text-gray-900">
                    Chat
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="relative ml-auto flex-1 md:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-full bg-gray-100 pl-10 pr-4 focus:bg-white focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <User className="h-5 w-5" />
            <span className="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{currentUser?.user.firstName || 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Messages</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Logout
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will end your current session.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onLogout}>Logout</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}