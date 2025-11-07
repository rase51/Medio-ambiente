"use client"
import { HabitsTab } from "./tabs/habits-tab"
import { ReportsTab } from "./tabs/reports-tab"
import { DashboardTab } from "./tabs/dashboard-tab"
import { GuideTab } from "./tabs/guide-tab"
import { CommunityTab } from "./tabs/community-tab"

interface User {
  id: string
  nickname: string
  avatar: { type: string; bgColor: string }
  habits: any[]
  reports: any[]
}

interface TabContentProps {
  activeTab: string
  user: User
  onUserUpdate: (updates: Partial<User>) => void
}

export function TabContent({ activeTab, user, onUserUpdate }: TabContentProps) {
  return (
    <div>
      {activeTab === "dashboard" && <DashboardTab user={user} />}
      {activeTab === "habits" && <HabitsTab user={user} onUserUpdate={onUserUpdate} />}
      {activeTab === "reports" && <ReportsTab user={user} onUserUpdate={onUserUpdate} />}
      {activeTab === "community" && <CommunityTab user={user} />}
      {activeTab === "guide" && <GuideTab />}
    </div>
  )
}
