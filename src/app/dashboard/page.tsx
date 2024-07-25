'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardUserComponent } from '../user/DashboardUserComponent'
import { HeaderComponent } from './HeaderComponent'
import { AsideComponent } from './AsideComponent' 
import { UserTable } from '../user/UserTable' 
import AIChat from '../chat/page'
import EmailPage from '../email/page'
import ProductDetail from '../product/[productId]/page'


export default function Dashboard() {

  const [userCount, setUserCount] = useState(0);
  const [weeklyUserCount, setWeeklyUserCount] = useState(0);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [users, setUsers] : any = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();  
  const [currentView, setCurrentView] = useState<'users' | 'chat' | 'email' | 'product'>('users');

  const handleViewChange = (view: 'users' | 'chat' | 'email' | 'product') => {
    setCurrentView(view);
  };


  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setUserCount(data.dailyCount);
        setWeeklyUserCount(data.weeklyCount);
        setTotalUserCount(data.totalCount);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Error fetching user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrorMessage('An unexpected error occurred');
    }
  };
  useEffect(() => {
  
    const getUserFromLocalStorage = () => {
      const userString = localStorage.getItem('user');
      if (userString && userString !== "undefined") {
        try {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
          // Optionally, clear the invalid data from localStorage
          localStorage.removeItem('user');
        }
      }
    }

   

    fetchUserData(); 
    getUserFromLocalStorage();
  }, []);

  const handleAddUser = async (data: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        // Refresh user data after adding new user
        fetchUserData();
      } else {
        console.error('Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

const handleUpdateUser = async (id: string, data: any) => {
  try {
    const response = await fetch(`/api/auth/users?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      // Refresh user data after update
      fetchUserData();
    } else {
      console.error('Failed to update user');
    }
  } catch (error) {
    console.error('Error updating user:', error);
  }
};

const handleDeleteUser = async (id: string) => {
  try {
    const response = await fetch(`/api/auth/users?id=${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      // Refresh user data after delete
      fetchUserData();
    } else {
      console.error('Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

  const handleLogout = async () => {
    // try {
    //   const response = await fetch('/api/auth/logout', { method: 'POST' });
    //   if (response.ok) {
        router.push('/auth/login');
    //   }
    // } catch (error) {
    //   console.error('Error logging out:', error);
    // }
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }
  
  const isThisWeek = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return date >= weekAgo && date <= today;
  }

  
  
  // const [currentViewH, setCurrentViewH] = useState<'users' | 'chat' | 'dashboard'>('chat');


  return (
    <TooltipProvider>
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AsideComponent onViewChange={handleViewChange} currentView={currentView} />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <HeaderComponent 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          currentView={currentView as 'users' | 'chat' | 'email'}  
          onViewChange={handleViewChange} 
        />
        {currentView === 'users' ? (
          <DashboardUserComponent 
            userCount={userCount} 
            weeklyUserCount={weeklyUserCount} 
            totalUserCount={totalUserCount} 
            UserTable={UserTable} 
            users={users} 
            isToday={isToday} 
            isThisWeek={isThisWeek}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onAddUser={handleAddUser}
          />
        ) : currentView === 'chat' ? (
          <AIChat />
        ) : currentView === 'product' ? (
          <ProductDetail />
        ) : (
          <EmailPage />
        )}
      </div>
    </div>
  </TooltipProvider>
  )
}


