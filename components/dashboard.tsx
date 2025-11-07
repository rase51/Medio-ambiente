"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { TabContent } from "./tab-content"

interface User {
  id: string
  nickname: string
  avatar: { type: string; bgColor: string }
  createdAt: string
  habits: any[]
  reports: any[]
}

interface DashboardProps {
  user: User
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [userData, setUserData] = useState(user)

  const updateUserData = (updates: Partial<User>) => {
    const updatedUser = { ...userData, ...updates }
    setUserData(updatedUser)
    localStorage.setItem("residuos_user", JSON.stringify(updatedUser))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header nickname={userData.nickname} />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-4 md:p-6">
          <Sidebar user={userData} activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

          {/* Main Content - now 4 columns */}
          <div className="lg:col-span-4">
            <TabContent activeTab={activeTab} user={userData} onUserUpdate={updateUserData} />
          </div>
        </div>
      </div>
    </div>
  )
}
