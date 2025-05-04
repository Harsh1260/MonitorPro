"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

// Update the DashboardContext type
const DashboardContext = createContext<{
  darkMode: boolean
  toggleDarkMode: () => void
  timeRange: string
  setTimeRange: (range: string) => void
  showSidebar: boolean
  toggleSidebar: () => void
  alerts: Alert[]
  dismissAlert: (id: string) => void
  acknowledgeAlert: (id: string) => void
  showNotifications: boolean
  toggleNotifications: () => void
  notificationCount: number
  showSettings: boolean
  toggleSettings: () => void
  thresholds: Thresholds
  updateThreshold: (key: keyof Thresholds, level: "warning" | "critical", value: number) => void
  expandedWidget: string | null
  setExpandedWidget: (id: string | null) => void
  activeSidebarItem: string
  setActiveSidebarItem: (item: string) => void
  showServersPanel: boolean
  toggleServersPanel: () => void
  showAlertsPanel: boolean
  toggleAlertsPanel: () => void
  showUsersPanel: boolean
  toggleUsersPanel: () => void
  showReportsPanel: boolean
  toggleReportsPanel: () => void
  isLandingPage: boolean
  setIsLandingPage: (value: boolean) => void
}>({
  darkMode: false,
  toggleDarkMode: () => {},
  timeRange: "24h",
  setTimeRange: () => {},
  showSidebar: true,
  toggleSidebar: () => {},
  alerts: [],
  dismissAlert: () => {},
  acknowledgeAlert: () => {},
  showNotifications: false,
  toggleNotifications: () => {},
  notificationCount: 0,
  showSettings: false,
  toggleSettings: () => {},
  thresholds: {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 70, critical: 90 },
    disk: { warning: 70, critical: 90 },
    temperature: { warning: 30, critical: 40 },
    network: { warning: 80, critical: 95 },
    errors: { warning: 5, critical: 15 },
  },
  updateThreshold: () => {},
  expandedWidget: null,
  setExpandedWidget: () => {},
  activeSidebarItem: "dashboard",
  setActiveSidebarItem: () => {},
  showServersPanel: false,
  toggleServersPanel: () => {},
  showAlertsPanel: false,
  toggleAlertsPanel: () => {},
  showUsersPanel: false,
  toggleUsersPanel: () => {},
  showReportsPanel: false,
  toggleReportsPanel: () => {},
  isLandingPage: true,
  setIsLandingPage: () => {},
})

// Types
type Alert = {
  id: string
  timestamp: Date
  severity: "low" | "medium" | "high"
  source: string
  description: string
  acknowledged: boolean
  dismissed: boolean
}

type ServerMetric = {
  timestamp: Date
  cpu: number
  memory: number
  disk: number
  temperature: number
  network: number
  errors: number
  users: number
  responseTime: number
}

type Thresholds = {
  cpu: { warning: number; critical: number }
  memory: { warning: number; critical: number }
  disk: { warning: number; critical: number }
  temperature: { warning: number; critical: number }
  network: { warning: number; critical: number }
  errors: { warning: number; critical: number }
}

type Server = {
  id: string
  name: string
  status: "online" | "warning" | "critical" | "offline"
  uptime: number
  location: string
}

// Utility functions
const formatDate = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString() + " " + date.toLocaleTimeString()
}

const getStatusColor = (value: number, warningThreshold: number, criticalThreshold: number): string => {
  if (value >= criticalThreshold) return "rgb(239, 68, 68)"
  if (value >= warningThreshold) return "rgb(234, 179, 8)"
  return "rgb(34, 197, 94)"
}

const getStatusClass = (value: number, warningThreshold: number, criticalThreshold: number): string => {
  if (value >= criticalThreshold) return "bg-red-500"
  if (value >= warningThreshold) return "bg-yellow-500"
  return "bg-green-500"
}

const getRandomValue = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const generateMockData = (timeRange: string): ServerMetric[] => {
  const now = new Date()
  const data: ServerMetric[] = []

  let points = 0
  let interval = 0

  switch (timeRange) {
    case "1h":
      points = 60
      interval = 60 * 1000 // 1 minute
      break
    case "24h":
      points = 24
      interval = 60 * 60 * 1000 // 1 hour
      break
    case "7d":
      points = 7
      interval = 24 * 60 * 60 * 1000 // 1 day
      break
    case "30d":
      points = 30
      interval = 24 * 60 * 60 * 1000 // 1 day
      break
    default:
      points = 24
      interval = 60 * 60 * 1000 // 1 hour
  }

  // Base values that will fluctuate
  let baseCpu = getRandomValue(30, 60)
  let baseMemory = getRandomValue(40, 70)
  let baseDisk = getRandomValue(50, 80)
  let baseTemp = getRandomValue(20, 30)
  let baseNetwork = getRandomValue(30, 70)
  let baseErrors = getRandomValue(0, 10)
  let baseUsers = getRandomValue(50, 200)
  let baseResponseTime = getRandomValue(100, 500)

  // Create a spike at a random point
  const spikePoint = getRandomValue(0, points - 1)

  for (let i = 0; i < points; i++) {
    const timestamp = new Date(now.getTime() - (points - i - 1) * interval)

    // Add some randomness to the values
    const fluctuation = getRandomValue(-5, 5)
    const cpuSpike = i === spikePoint ? getRandomValue(20, 40) : 0
    const memorySpike = i === spikePoint ? getRandomValue(15, 30) : 0

    data.push({
      timestamp,
      cpu: Math.min(100, Math.max(0, baseCpu + fluctuation + cpuSpike)),
      memory: Math.min(100, Math.max(0, baseMemory + fluctuation + memorySpike)),
      disk: Math.min(100, Math.max(0, baseDisk + getRandomValue(-2, 2))),
      temperature: Math.min(50, Math.max(15, baseTemp + getRandomValue(-3, 3))),
      network: Math.min(100, Math.max(0, baseNetwork + getRandomValue(-10, 10))),
      errors: Math.max(0, baseErrors + getRandomValue(-2, 3)),
      users: Math.max(0, baseUsers + getRandomValue(-20, 20)),
      responseTime: Math.max(50, baseResponseTime + getRandomValue(-50, 50)),
    })

    // Gradually change the base values to simulate trends
    baseCpu += getRandomValue(-2, 2)
    baseMemory += getRandomValue(-1, 2)
    baseDisk += getRandomValue(0, 1) // Disk usage tends to increase
    baseTemp += getRandomValue(-1, 1)
    baseNetwork += getRandomValue(-5, 5)
    baseErrors += getRandomValue(-1, 1)
    baseUsers += getRandomValue(-10, 10)
    baseResponseTime += getRandomValue(-20, 20)
  }

  return data
}

const generateMockServers = (): Server[] => {
  return [
    {
      id: "srv-001",
      name: "Web Server 1",
      status: "online",
      uptime: 15.4, // days
      location: "US East",
    },
    {
      id: "srv-002",
      name: "API Server",
      status: "warning",
      uptime: 7.2,
      location: "US West",
    },
    {
      id: "srv-003",
      name: "Database Primary",
      status: "online",
      uptime: 30.1,
      location: "EU Central",
    },
    {
      id: "srv-004",
      name: "Database Replica",
      status: "online",
      uptime: 25.6,
      location: "EU Central",
    },
    {
      id: "srv-005",
      name: "Cache Server",
      status: "critical",
      uptime: 0.3,
      location: "Asia Pacific",
    },
    {
      id: "srv-006",
      name: "Backup Server",
      status: "offline",
      uptime: 0,
      location: "US East",
    },
  ]
}

const generateMockAlerts = (): Alert[] => {
  const now = new Date()
  return [
    {
      id: "alert-001",
      timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
      severity: "high",
      source: "Web Server 1",
      description: "CPU usage exceeded 90% for 5 minutes",
      acknowledged: false,
      dismissed: false,
    },
    {
      id: "alert-002",
      timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
      severity: "medium",
      source: "API Server",
      description: "Memory usage at 75%, approaching threshold",
      acknowledged: true,
      dismissed: false,
    },
    {
      id: "alert-003",
      timestamp: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
      severity: "low",
      source: "Database Replica",
      description: "Replication lag increased to 5 seconds",
      acknowledged: false,
      dismissed: false,
    },
    {
      id: "alert-004",
      timestamp: new Date(now.getTime() - 120 * 60 * 1000), // 2 hours ago
      severity: "high",
      source: "Cache Server",
      description: "Service restarted unexpectedly",
      acknowledged: false,
      dismissed: false,
    },
    {
      id: "alert-005",
      timestamp: new Date(now.getTime() - 180 * 60 * 1000), // 3 hours ago
      severity: "high",
      source: "Backup Server",
      description: "Server unreachable, backup process failed",
      acknowledged: true,
      dismissed: false,
    },
  ]
}

// Update the DashboardProvider to include the new state
const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false)
  const [timeRange, setTimeRange] = useState("24h")
  const [showSidebar, setShowSidebar] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>(generateMockAlerts())
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null)
  const [activeSidebarItem, setActiveSidebarItem] = useState("dashboard")
  const [showServersPanel, setShowServersPanel] = useState(false)
  const [showAlertsPanel, setShowAlertsPanel] = useState(false)
  const [showUsersPanel, setShowUsersPanel] = useState(false)
  const [showReportsPanel, setShowReportsPanel] = useState(false)
  const [isLandingPage, setIsLandingPage] = useState(true)
  const [thresholds, setThresholds] = useState<Thresholds>({
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 70, critical: 90 },
    disk: { warning: 70, critical: 90 },
    temperature: { warning: 30, critical: 40 },
    network: { warning: 80, critical: 95 },
    errors: { warning: 5, critical: 15 },
  })

  const toggleDarkMode = () => setDarkMode(!darkMode)
  const toggleSidebar = () => setShowSidebar(!showSidebar)
  const toggleNotifications = () => setShowNotifications(!showNotifications)
  const toggleSettings = () => setShowSettings(!showSettings)
  const toggleServersPanel = () => {
    setShowServersPanel(!showServersPanel)
    if (!showServersPanel) {
      setShowAlertsPanel(false)
      setShowUsersPanel(false)
      setShowReportsPanel(false)
    }
  }
  const toggleAlertsPanel = () => {
    setShowAlertsPanel(!showAlertsPanel)
    if (!showAlertsPanel) {
      setShowServersPanel(false)
      setShowUsersPanel(false)
      setShowReportsPanel(false)
    }
  }
  const toggleUsersPanel = () => {
    setShowUsersPanel(!showUsersPanel)
    if (!showUsersPanel) {
      setShowServersPanel(false)
      setShowAlertsPanel(false)
      setShowReportsPanel(false)
    }
  }
  const toggleReportsPanel = () => {
    setShowReportsPanel(!showReportsPanel)
    if (!showReportsPanel) {
      setShowServersPanel(false)
      setShowAlertsPanel(false)
      setShowUsersPanel(false)
    }
  }

  const dismissAlert = (id: string) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, dismissed: true } : alert)))
  }

  const acknowledgeAlert = (id: string) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert)))
  }

  const updateThreshold = (key: keyof Thresholds, level: "warning" | "critical", value: number) => {
    setThresholds({
      ...thresholds,
      [key]: {
        ...thresholds[key],
        [level]: value,
      },
    })
  }

  // Generate a new alert randomly
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldGenerateAlert = Math.random() < 0.3 // 30% chance

      if (shouldGenerateAlert) {
        const sources = [
          "Web Server 1",
          "API Server",
          "Database Primary",
          "Database Replica",
          "Cache Server",
          "Backup Server",
        ]
        const severities: ("low" | "medium" | "high")[] = ["low", "medium", "high"]
        const descriptions = [
          "CPU usage spike detected",
          "Memory usage approaching threshold",
          "Disk space running low",
          "High network latency detected",
          "Error rate increased",
          "Service restarted unexpectedly",
          "Connection timeout",
          "Database query performance degraded",
        ]

        const newAlert: Alert = {
          id: `alert-${Date.now()}`,
          timestamp: new Date(),
          severity: severities[Math.floor(Math.random() * severities.length)],
          source: sources[Math.floor(Math.random() * sources.length)],
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          acknowledged: false,
          dismissed: false,
        }

        setAlerts((prevAlerts) => [newAlert, ...prevAlerts])
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const notificationCount = alerts.filter((alert) => !alert.acknowledged && !alert.dismissed).length

  return (
    <DashboardContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        timeRange,
        setTimeRange,
        showSidebar,
        toggleSidebar,
        alerts,
        dismissAlert,
        acknowledgeAlert,
        showNotifications,
        toggleNotifications,
        notificationCount,
        showSettings,
        toggleSettings,
        thresholds,
        updateThreshold,
        expandedWidget,
        setExpandedWidget,
        activeSidebarItem,
        setActiveSidebarItem,
        showServersPanel,
        toggleServersPanel,
        showAlertsPanel,
        toggleAlertsPanel,
        showUsersPanel,
        toggleUsersPanel,
        showReportsPanel,
        toggleReportsPanel,
        isLandingPage,
        setIsLandingPage,
      }}
    >
      <div className={darkMode ? "dark" : ""}>{children}</div>
    </DashboardContext.Provider>
  )
}

const useDashboard = () => useContext(DashboardContext)

// Add new icons for the landing page
const IconArrowRight = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
)

const IconShield = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)

const IconSpeed = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m5 12 7-7 7 7"></path>
    <path d="M12 5v14"></path>
  </svg>
)

const IconGraph = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18"></path>
    <path d="m19 9-5 5-4-4-3 3"></path>
  </svg>
)

// Icon components
const IconMenu = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="12" y2="12"></line>
    <line x1="4" x2="20" y1="6" y2="6"></line>
    <line x1="4" x2="20" y1="18" y2="18"></line>
  </svg>
)

const IconDashboard = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="7" height="9" x="3" y="3" rx="1"></rect>
    <rect width="7" height="5" x="14" y="3" rx="1"></rect>
    <rect width="7" height="9" x="14" y="12" rx="1"></rect>
    <rect width="7" height="5" x="3" y="16" rx="1"></rect>
  </svg>
)

const IconServers = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect>
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect>
    <line x1="6" x2="6.01" y1="6" y2="6"></line>
    <line x1="6" x2="6.01" y1="18" y2="18"></line>
  </svg>
)

const IconAlerts = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
  </svg>
)

const IconSettings = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
)

const IconUsers = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)

const IconReports = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <path d="M14 2v6h6"></path>
    <path d="M16 13H8"></path>
    <path d="M16 17H8"></path>
    <path d="M10 9H8"></path>
  </svg>
)

const IconSun = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2"></path>
    <path d="M12 20v2"></path>
    <path d="m4.93 4.93 1.41 1.41"></path>
    <path d="m17.66 17.66 1.41 1.41"></path>
    <path d="M2 12h2"></path>
    <path d="M20 12h2"></path>
    <path d="m6.34 17.66-1.41 1.41"></path>
    <path d="m19.07 4.93-1.41 1.41"></path>
  </svg>
)

const IconMoon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
)

const IconBell = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
  </svg>
)

const IconExpand = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 3 6 6m0-6-6 6"></path>
    <path d="M9 21 3 15m0 6 6-6"></path>
  </svg>
)

const IconCollapse = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 6-6m0 6L3 3"></path>
    <path d="m21 15-6 6m0-6 6 6"></path>
  </svg>
)

const IconClose = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
)

const IconCheck = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5"></path>
  </svg>
)

const IconCPU = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="16" height="16" rx="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <path d="M15 2v2"></path>
    <path d="M15 20v2"></path>
    <path d="M2 15h2"></path>
    <path d="M2 9h2"></path>
    <path d="M20 15h2"></path>
    <path d="M20 9h2"></path>
    <path d="M9 2v2"></path>
    <path d="M9 20v2"></path>
  </svg>
)

const IconMemory = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 19v-3"></path>
    <path d="M10 19v-3"></path>
    <path d="M14 19v-3"></path>
    <path d="M18 19v-3"></path>
    <path d="M8 11V9"></path>
    <path d="M16 11V9"></path>
    <path d="M12 11V9"></path>
    <path d="M2 15h20"></path>
    <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"></path>
  </svg>
)

const IconDisk = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
)

const IconTemperature = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
  </svg>
)

const IconNetwork = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="8" rx="2"></rect>
    <rect x="2" y="14" width="20" height="8" rx="2"></rect>
    <path d="M6 10v4"></path>
    <path d="M12 10v4"></path>
    <path d="M18 10v4"></path>
  </svg>
)

const IconError = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m8 2 1.88 1.88"></path>
    <path d="M14.12 3.88 16 2"></path>
    <path d="M9 7.13v-1a3.003 3.003 0 0 1 6 0v1"></path>
    <path d="M12 16a4 4 0 0 1-4-4v-2a4 4 0 0 1 8 0v2a4 4 0 0 1-4 4Z"></path>
    <path d="m2 22 20-20"></path>
  </svg>
)

const IconUser = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const IconClock = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
)

// Update the Sidebar component to handle the new functionality
const Sidebar = () => {
  const {
    showSidebar,
    darkMode,
    activeSidebarItem,
    setActiveSidebarItem,
    toggleServersPanel,
    toggleAlertsPanel,
    toggleUsersPanel,
    toggleReportsPanel,
    setIsLandingPage,
  } = useDashboard()

  const handleItemClick = (item: string) => {
    setActiveSidebarItem(item)

    if (item === "dashboard") {
      setIsLandingPage(false)
    } else if (item === "servers") {
      toggleServersPanel()
    } else if (item === "alerts") {
      toggleAlertsPanel()
    } else if (item === "users") {
      toggleUsersPanel()
    } else if (item === "reports") {
      toggleReportsPanel()
    }
  }

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: showSidebar ? 0 : -300 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-y-0 left-0 z-20 w-64 border-r bg-background dark:border-gray-800 ${
        showSidebar ? "block" : "hidden"
      }`}
    >
      <div className="flex h-16 items-center border-b px-6 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <button
        onClick={() => setIsLandingPage(true)}
        className="flex items-center gap-2 text-lg font-semibold"
          >
        <IconDashboard />
        MonitorPro
          </button>
        </div>
      </div>
      <nav className="space-y-1 p-4">
        <a
          href="#"
          onClick={() => handleItemClick("dashboard")}
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            activeSidebarItem === "dashboard"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <IconDashboard />
          Dashboard
        </a>
        <a
          href="#"
          onClick={() => handleItemClick("servers")}
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            activeSidebarItem === "servers"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <IconServers />
          Servers
        </a>
        <a
          href="#"
          onClick={() => handleItemClick("alerts")}
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            activeSidebarItem === "alerts"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <IconAlerts />
          Alerts
        </a>
        <a
          href="#"
          onClick={() => handleItemClick("users")}
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            activeSidebarItem === "users"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <IconUsers />
          Users
        </a>
        <a
          href="#"
          onClick={() => handleItemClick("reports")}
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            activeSidebarItem === "reports"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <IconReports />
          Reports
        </a>
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="rounded-md bg-gray-100 p-4 dark:bg-gray-800">
          <h3 className="font-medium">System Status</h3>
          <div className="mt-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Uptime</span>
              <span>99.98%</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>Last Check</span>
              <span>2 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

// Create new panel components for each sidebar item
const ServersPanel = () => {
  const { showServersPanel, toggleServersPanel } = useDashboard()
  const [servers] = useState<Server[]>(generateMockServers())

  return (
    <AnimatePresence>
      {showServersPanel && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-y-0 right-0 z-40 w-96 border-l bg-background p-4 shadow-lg dark:border-gray-800"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Servers Management</h2>
            <button
              onClick={toggleServersPanel}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8"
            >
              <IconClose />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="mt-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-md font-medium">Server List</h3>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                Add Server
              </button>
            </div>
            <div className="space-y-4">
              {servers.map((server) => (
                <motion.div
                  key={server.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 border rounded-lg dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          server.status === "online"
                            ? "bg-green-500"
                            : server.status === "warning"
                              ? "bg-yellow-500"
                              : server.status === "critical"
                                ? "bg-red-500"
                                : "bg-gray-500"
                        }`}
                      ></div>
                      <h4 className="font-medium">{server.name}</h4>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Location:</span> {server.location}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Uptime:</span> {server.uptime.toFixed(1)}{" "}
                        days
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">IP:</span> 192.168.1.
                        {Math.floor(Math.random() * 255)}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>{" "}
                        {Math.random() > 0.5 ? "Physical" : "Virtual"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
                      Restart
                    </button>
                    <button className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                      Details
                    </button>
                    <button className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                      Logs
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const AlertsPanel = () => {
  const { showAlertsPanel, toggleAlertsPanel, alerts, dismissAlert, acknowledgeAlert } = useDashboard()
  const activeAlerts = alerts.filter((alert) => !alert.dismissed)

  return (
    <AnimatePresence>
      {showAlertsPanel && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-y-0 right-0 z-40 w-96 border-l bg-background p-4 shadow-lg dark:border-gray-800"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Alert Management</h2>
            <button
              onClick={toggleAlertsPanel}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8"
            >
              <IconClose />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-medium">Active Alerts</h3>
              <div className="flex gap-2">
                <select className="text-sm border rounded-md px-2 py-1 dark:bg-gray-800 dark:border-gray-700">
                  <option>All Severities</option>
                  <option>High Priority</option>
                  <option>Medium Priority</option>
                  <option>Low Priority</option>
                </select>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                  Configure
                </button>
              </div>
            </div>
            <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 8rem)" }}>
              {activeAlerts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No active alerts</p>
              ) : (
                activeAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`rounded-md border p-3 ${
                      alert.severity === "high"
                        ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
                        : alert.severity === "medium"
                          ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20"
                          : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{alert.source}</h3>
                        <p className="text-sm">{alert.description}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formatFullDate(alert.timestamp)}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-7 w-7 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                            title="Acknowledge"
                          >
                            <IconCheck className="h-4 w-4" />
                            <span className="sr-only">Acknowledge</span>
                          </button>
                        )}
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-7 w-7 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                          title="Dismiss"
                        >
                          <IconClose className="h-4 w-4" />
                          <span className="sr-only">Dismiss</span>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          alert.severity === "high"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : alert.severity === "medium"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {alert.severity === "high"
                          ? "High Priority"
                          : alert.severity === "medium"
                            ? "Medium Priority"
                            : "Low Priority"}
                      </span>
                      {alert.acknowledged && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const UsersPanel = () => {
  const { showUsersPanel, toggleUsersPanel } = useDashboard()
  const [users] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Administrator",
      email: "sarah.j@example.com",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      status: "Active",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "DevOps Engineer",
      email: "michael.c@example.com",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      status: "Active",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "System Analyst",
      email: "emily.r@example.com",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      status: "Away",
    },
    {
      id: 4,
      name: "David Kim",
      role: "Security Specialist",
      email: "david.k@example.com",
      avatar: "https://randomuser.me/api/portraits/men/15.jpg",
      status: "Active",
    },
    {
      id: 5,
      name: "Jessica Taylor",
      role: "Network Engineer",
      email: "jessica.t@example.com",
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
      status: "Inactive",
    },
  ])

  return (
    <AnimatePresence>
      {showUsersPanel && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-y-0 right-0 z-40 w-96 border-l bg-background p-4 shadow-lg dark:border-gray-800"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">User Management</h2>
            <button
              onClick={toggleUsersPanel}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8"
            >
              <IconClose />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="mt-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-md font-medium">System Users</h3>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                Add User
              </button>
            </div>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="space-y-4">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 border rounded-lg dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="h-10 w-10 rounded-full" />
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : user.status === "Away"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Email:</span> {user.email}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
                      Edit
                    </button>
                    <button className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                      Permissions
                    </button>
                    <button className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors">
                      Disable
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const ReportsPanel = () => {
  const { showReportsPanel, toggleReportsPanel } = useDashboard()
  const [reports] = useState([
    { id: 1, name: "System Performance", type: "Daily", lastGenerated: "Today, 06:00 AM", status: "Generated" },
    { id: 2, name: "Security Audit", type: "Weekly", lastGenerated: "May 1, 2023", status: "Generated" },
    { id: 3, name: "Resource Utilization", type: "Daily", lastGenerated: "Today, 06:00 AM", status: "Generated" },
    { id: 4, name: "User Activity", type: "Monthly", lastGenerated: "Apr 30, 2023", status: "Pending" },
    { id: 5, name: "Incident Report", type: "On-demand", lastGenerated: "Apr 28, 2023", status: "Generated" },
  ])

  return (
    <AnimatePresence>
      {showReportsPanel && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-y-0 right-0 z-40 w-96 border-l bg-background p-4 shadow-lg dark:border-gray-800"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Reports</h2>
            <button
              onClick={toggleReportsPanel}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8"
            >
              <IconClose />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="mt-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-md font-medium">Available Reports</h3>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                New Report
              </button>
            </div>
            <div className="space-y-4">
              {reports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 border rounded-lg dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{report.name}</h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        report.status === "Generated"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Type:</span> {report.type}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Last Generated:</span> {report.lastGenerated}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
                      Download
                    </button>
                    <button className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                      View
                    </button>
                    <button className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                      Schedule
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Create the LandingPage component
const LandingPage = () => {
  const { setIsLandingPage, darkMode } = useDashboard()

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1772&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Real-Time Monitoring Dashboard</h1>
            <p className="text-xl md:text-2xl mb-8">
              Monitor your entire infrastructure with our powerful, intuitive dashboard. Get real-time alerts and
              insights to keep your systems running smoothly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLandingPage(false)}
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Launch Dashboard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                Watch Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background dark:from-gray-900 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Monitoring Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need to keep your systems running at peak performance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <IconGraph />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-Time Metrics</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Monitor CPU, memory, disk usage, and more with real-time updates and historical data.
              </p>
              <a href="#" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
                Learn more <IconArrowRight className="ml-2 w-4 h-4" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
                <IconAlerts />
              </div>
              <h3 className="text-xl font-bold mb-3">Intelligent Alerts</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get notified instantly when issues arise with customizable thresholds and alert routing.
              </p>
              <a href="#" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
                Learn more <IconArrowRight className="ml-2 w-4 h-4" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                <IconShield />
              </div>
              <h3 className="text-xl font-bold mb-3">Proactive Security</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Identify security threats before they become problems with advanced anomaly detection.
              </p>
              <a href="#" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
                Learn more <IconArrowRight className="ml-2 w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Powerful Dashboard at Your Fingertips</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Our intuitive dashboard gives you a complete view of your infrastructure. Customize widgets, set alerts,
                and get the insights you need to make informed decisions.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="mr-3 mt-1 text-green-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Customizable widget layout</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 mt-1 text-green-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Real-time data visualization</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 mt-1 text-green-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Configurable alert thresholds</span>
                </li>
              </ul>
              <button
                onClick={() => setIsLandingPage(false)}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try the Dashboard
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:w-1/2"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    alt="Dashboard Preview"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              See what our customers have to say about our monitoring solution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <img
                    src="https://randomuser.me/api/portraits/women/32.jpg"
                    alt="Testimonial"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold">Jennifer Lee</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">CTO, TechCorp</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                "This monitoring solution has transformed how we manage our infrastructure. The real-time alerts have
                helped us prevent several major outages."
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <img
                    src="https://randomuser.me/api/portraits/men/54.jpg"
                    alt="Testimonial"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold">Marcus Johnson</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">DevOps Lead, CloudNine</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                "The customizable dashboards and detailed metrics have given our team unprecedented visibility into our
                systems. It's become an essential tool for us."
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <img
                    src="https://randomuser.me/api/portraits/women/68.jpg"
                    alt="Testimonial"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold">Sophia Rodriguez</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">SRE Manager, DataFlow</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                "The proactive alerts and detailed analytics have reduced our MTTR by 60%. I can't imagine managing our
                infrastructure without this tool now."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your monitoring?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Get started with our powerful monitoring dashboard today and take control of your infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLandingPage(false)}
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Launch Dashboard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                Contact Sales
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 text-white mb-4">
                <IconDashboard />
                <h3 className="text-lg font-semibold">MonitorPro</h3>
              </div>
              <p className="mb-4">Powerful monitoring solutions for modern infrastructure.</p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Changelog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p>&copy; {new Date().getFullYear()} MonitorPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Update the Dashboard component to include the new panels
const Dashboard = () => {
  const {
    showSidebar,
    timeRange,
    thresholds,
    setExpandedWidget,
    isLandingPage,
    showServersPanel,
    showAlertsPanel,
    showUsersPanel,
    showReportsPanel,
  } = useDashboard()
  const [data, setData] = useState<ServerMetric[]>([])
  const [servers, setServers] = useState<Server[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Update data based on time range
  useEffect(() => {
    setData(generateMockData(timeRange))
    setServers(generateMockServers())
    setLastUpdate(new Date())
  }, [timeRange])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData(timeRange))
      setLastUpdate(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [timeRange])

  // Get the latest data point
  const latestData = data.length > 0 ? data[data.length - 1] : null

  if (isLandingPage) {
    return <LandingPage />
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gray-900 dark:text-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 transition-all duration-300 ${showSidebar ? "md:ml-64" : ""}`}>
          <div className="container mx-auto p-4 md:p-6">
            <div className="mb-6 mt-16 flex items-center justify-between">
              <h1 className="text-2xl font-bold">System Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {formatFullDate(lastUpdate)}</p>
            </div>

            {latestData && (
              <>
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    onClick={() => setExpandedWidget("cpu")}
                    className="cursor-pointer"
                  >
                    <StatusCard
                      title="CPU Usage"
                      value={latestData.cpu}
                      icon={<IconCPU />}
                      warningThreshold={thresholds.cpu.warning}
                      criticalThreshold={thresholds.cpu.critical}
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    onClick={() => setExpandedWidget("memory")}
                    className="cursor-pointer"
                  >
                    <StatusCard
                      title="Memory Usage"
                      value={latestData.memory}
                      icon={<IconMemory />}
                      warningThreshold={thresholds.memory.warning}
                      criticalThreshold={thresholds.memory.critical}
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    onClick={() => setExpandedWidget("disk")}
                    className="cursor-pointer"
                  >
                    <StatusCard
                      title="Disk Usage"
                      value={latestData.disk}
                      icon={<IconDisk />}
                      warningThreshold={thresholds.disk.warning}
                      criticalThreshold={thresholds.disk.critical}
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    onClick={() => setExpandedWidget("temperature")}
                    className="cursor-pointer"
                  >
                    <TemperatureCard
                      value={latestData.temperature}
                      warningThreshold={thresholds.temperature.warning}
                      criticalThreshold={thresholds.temperature.critical}
                    />
                  </motion.div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      onClick={() => setExpandedWidget("network")}
                      className="cursor-pointer"
                    >
                      <NetworkTrafficChart data={data} />
                    </motion.div>
                  </div>
                  <div>
                    <ServerStatusCard servers={servers} />
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    onClick={() => setExpandedWidget("users")}
                    className="cursor-pointer"
                  >
                    <UserActivityChart data={data} />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    onClick={() => setExpandedWidget("errors")}
                    className="cursor-pointer"
                  >
                    <ErrorRateChart data={data} thresholds={thresholds.errors} />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    onClick={() => setExpandedWidget("responseTime")}
                    className="cursor-pointer"
                  >
                    <ResponseTimeChart data={data} />
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <NotificationsPanel />
      <SettingsPanel />
      <ServersPanel />
      <AlertsPanel />
      <UsersPanel />
      <ReportsPanel />
      <AnimatePresence>
        <ExpandedWidget />
      </AnimatePresence>
    </div>
  )
}

const NotificationsPanel = () => {
  const { showNotifications, toggleNotifications, alerts, dismissAlert, acknowledgeAlert } = useDashboard()
  const activeAlerts = alerts.filter((alert) => !alert.acknowledged && !alert.dismissed)

  return (
    <AnimatePresence>
      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "50%" }}
          animate={{ opacity: 1, y: 0, x: "50%" }}
          exit={{ opacity: 0, y: -50, x: "50%" }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-1/2 z-50 w-96 -translate-x-1/2 rounded-md border bg-background p-4 shadow-lg dark:border-gray-800"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <button
              onClick={toggleNotifications}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8"
            >
              <IconClose />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="mt-4">
            {activeAlerts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No new notifications</p>
            ) : (
              activeAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-md border p-3 ${
                    alert.severity === "high"
                      ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
                      : alert.severity === "medium"
                        ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20"
                        : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{alert.source}</h3>
                      <p className="text-sm">{alert.description}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatFullDate(alert.timestamp)}</p>
                    </div>
                    <div className="flex space-x-1">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-7 w-7 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          title="Acknowledge"
                        >
                          <IconCheck className="h-4 w-4" />
                          <span className="sr-only">Acknowledge</span>
                        </button>
                      )}
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-7 w-7 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                        title="Dismiss"
                      >
                        <IconClose className="h-4 w-4" />
                        <span className="sr-only">Dismiss</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        alert.severity === "high"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : alert.severity === "medium"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {alert.severity === "high"
                        ? "High Priority"
                        : alert.severity === "medium"
                          ? "Medium Priority"
                          : "Low Priority"}
                    </span>
                    {alert.acknowledged && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Acknowledged
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const SettingsPanel = () => {
  const {
    showSettings,
    toggleSettings,
    darkMode,
    toggleDarkMode,
    timeRange,
    setTimeRange,
    thresholds,
    updateThreshold,
  } = useDashboard()

  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-y-0 left-0 z-50 w-96 border-r bg-background p-4 shadow-lg dark:border-gray-800"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Settings</h2>
            <button
              onClick={toggleSettings}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8"
            >
              <IconClose />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-md font-medium">Appearance</h3>
              <div className="mt-2 flex items-center justify-between">
                <span>Dark Mode</span>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    darkMode ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span className="sr-only">Enable dark mode</span>
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                      darkMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium">Time Range</h3>
              <div className="mt-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="1h">Last 1 Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium">Thresholds</h3>
              <div className="mt-2 space-y-3">
                {Object.entries(thresholds).map(([key, value]) => (
                  <div key={key}>
                    <label
                      htmlFor={`${key}-warning`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize"
                    >
                      {key}
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name={`${key}-warning`}
                        id={`${key}-warning`}
                        className="mr-2 block w-1/2 min-w-0 flex-1 rounded-md border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50"
                        placeholder="Warning"
                        value={value.warning}
                        onChange={(e) => updateThreshold(key as keyof Thresholds, "warning", Number(e.target.value))}
                      />
                      <input
                        type="number"
                        name={`${key}-critical`}
                        id={`${key}-critical`}
                        className="block w-1/2 min-w-0 flex-1 rounded-md border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50"
                        placeholder="Critical"
                        value={value.critical}
                        onChange={(e) => updateThreshold(key as keyof Thresholds, "critical", Number(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const ExpandedWidget = () => {
  const { expandedWidget, setExpandedWidget, timeRange, thresholds } = useDashboard()
  const [data, setData] = useState<ServerMetric[]>([])

  useEffect(() => {
    setData(generateMockData(timeRange))
  }, [timeRange])

  if (!expandedWidget) return null

  let title = ""
  let chart = null

  switch (expandedWidget) {
    case "cpu":
      title = "CPU Usage"
      chart = (
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cpuColorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cpuColorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="timestamp" tickFormatter={formatDate} />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip labelFormatter={formatFullDate} />
          <Area type="monotone" dataKey="cpu" stroke="#8884d8" fillOpacity={1} fill="url(#cpuColorUv)" />
          <ReferenceLine y={thresholds.cpu.warning} stroke="orange" strokeDasharray="3 3" />
          <ReferenceLine y={thresholds.cpu.critical} stroke="red" strokeDasharray="3 3" />
        </AreaChart>
      )
      break
    case "memory":
      title = "Memory Usage"
      chart = (
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="memoryColorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="memoryColorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="timestamp" tickFormatter={formatDate} />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip labelFormatter={formatFullDate} />
          <Area type="monotone" dataKey="memory" stroke="#8884d8" fillOpacity={1} fill="url(#memoryColorUv)" />
          <ReferenceLine y={thresholds.memory.warning} stroke="orange" strokeDasharray="3 3" />
          <ReferenceLine y={thresholds.memory.critical} stroke="red" strokeDasharray="3 3" />
        </AreaChart>
      )
      break
    case "disk":
      title = "Disk Usage"
      chart = (
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="diskColorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="diskColorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="timestamp" tickFormatter={formatDate} />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip labelFormatter={formatFullDate} />
          <Area type="monotone" dataKey="disk" stroke="#8884d8" fillOpacity={1} fill="url(#diskColorUv)" />
          <ReferenceLine y={thresholds.disk.warning} stroke="orange" strokeDasharray="3 3" />
          <ReferenceLine y={thresholds.disk.critical} stroke="red" strokeDasharray="3 3" />
        </AreaChart>
      )
      break
    case "temperature":
      title = "Temperature"
      chart = (
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={formatFullDate} />
          <Line type="monotone" dataKey="temperature" stroke="#82ca9d" />
          <ReferenceLine y={thresholds.temperature.warning} stroke="orange" strokeDasharray="3 3" />
          <ReferenceLine y={thresholds.temperature.critical} stroke="red" strokeDasharray="3 3" />
        </LineChart>
      )
      break
    case "network":
      title = "Network Traffic"
      chart = (
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={formatFullDate} />
          <Line type="monotone" dataKey="network" stroke="#82ca9d" />
          <ReferenceLine y={thresholds.network.warning} stroke="orange" strokeDasharray="3 3" />
          <ReferenceLine y={thresholds.network.critical} stroke="red" strokeDasharray="3 3" />
        </LineChart>
      )
      break
    case "users":
      title = "User Activity"
      chart = (
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={formatFullDate} />
          <Bar dataKey="users" fill="#8884d8" />
        </BarChart>
      )
      break
    case "errors":
      title = "Error Rate"
      chart = (
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={formatFullDate} />
          <Line type="monotone" dataKey="errors" stroke="#ff0000" />
          <ReferenceLine y={thresholds.errors.warning} stroke="orange" strokeDasharray="3 3" />
          <ReferenceLine y={thresholds.errors.critical} stroke="red" strokeDasharray="3 3" />
        </LineChart>
      )
      break
    case "responseTime":
      title = "Response Time"
      chart = (
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={formatFullDate} />
          <Line type="monotone" dataKey="responseTime" stroke="#0088ff" />
        </LineChart>
      )
      break
    default:
      return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.5 }}
        className="w-3/4 rounded-md bg-background p-6 shadow-lg dark:border-gray-800"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={() => setExpandedWidget(null)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8"
          >
            <IconClose />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          {chart}
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  )
}

const Navbar = () => {
  const { toggleSidebar, darkMode, toggleDarkMode, toggleNotifications, toggleSettings, notificationCount } =
    useDashboard()

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 border-b bg-background px-4 py-3 dark:border-gray-800">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <IconMenu />
          </button>
          <h1 className="text-lg font-semibold">MonitorPro</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleNotifications}
            className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <IconBell />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white">
                {notificationCount}
              </span>
            )}
          </button>
          <button
            onClick={toggleSettings}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <IconSettings />
          </button>
          <button
            onClick={toggleDarkMode}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {darkMode ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </div>
    </nav>
  )
}

const StatusCard = ({
  title,
  value,
  icon,
  warningThreshold,
  criticalThreshold,
}: { title: string; value: number; icon: React.ReactNode; warningThreshold: number; criticalThreshold: number }) => {
  const statusColor = getStatusColor(value, warningThreshold, criticalThreshold)
  const statusClass = getStatusClass(value, warningThreshold, criticalThreshold)

  return (
    <div className="rounded-md border bg-background p-4 shadow-sm dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-md p-2 text-gray-500 dark:text-gray-400">{icon}</span>
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass} text-white`}>{value}%</span>
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="mr-1">Status:</span>
        <span style={{ color: statusColor }}>
          {value < warningThreshold ? "Normal" : value < criticalThreshold ? "Warning" : "Critical"}
        </span>
      </div>
    </div>
  )
}

const TemperatureCard = ({
  value,
  warningThreshold,
  criticalThreshold,
}: { value: number; warningThreshold: number; criticalThreshold: number }) => {
  const statusColor = getStatusColor(value, warningThreshold, criticalThreshold)
  const statusClass = getStatusClass(value, warningThreshold, criticalThreshold)

  return (
    <div className="rounded-md border bg-background p-4 shadow-sm dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconTemperature />
          <h3 className="text-sm font-medium">Temperature</h3>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass} text-white`}>{value}°C</span>
      </div>
      <div className="mt-2 text-3xl font-bold">{value}°C</div>
      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="mr-1">Status:</span>
        <span style={{ color: statusColor }}>
          {value < warningThreshold ? "Normal" : value < criticalThreshold ? "Warning" : "Critical"}
        </span>
      </div>
    </div>
  )
}

const NetworkTrafficChart = ({ data }: { data: ServerMetric[] }) => {
  return (
    <div className="rounded-md border bg-background p-4 shadow-sm dark:border-gray-800">
      <h3 className="mb-4 text-sm font-medium">Network Traffic</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={formatFullDate} />
          <Line type="monotone" dataKey="network" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const ServerStatusCard = ({ servers }: { servers: Server[] }) => {
  return (
    <div className="rounded-md border bg-background p-4 shadow-sm dark:border-gray-800">
      <h3 className="mb-4 text-sm font-medium">Server Status</h3>
      <div className="space-y-3">
        {servers.map((server) => (
          <div key={server.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  server.status === "online"
                    ? "bg-green-500"
                    : server.status === "warning"
                      ? "bg-yellow-500"
                      : server.status === "critical"
                        ? "bg-red-500"
                        : "bg-gray-500"
                }`}
              ></div>
              <span className="text-sm">{server.name}</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{server.location}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const UserActivityChart = ({ data }: { data: ServerMetric[] }) => {
  return (
    <div className="rounded-md border bg-background p-4 shadow-sm dark:border-gray-800">
      <h3 className="mb-4 text-sm font-medium">User Activity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={formatFullDate} />
          <Bar dataKey="users" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const ErrorRateChart = ({
  data,
  thresholds,
}: { data: ServerMetric[]; thresholds: { warning: number; critical: number } }) => {
  return (
    <div className="rounded-md border bg-background p-4 shadow-sm dark:border-gray-800">
      <h3 className="mb-4 text-sm font-medium">Error Rate</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={formatFullDate} />
          <Line type="monotone" dataKey="errors" stroke="#ff0000" />
          <ReferenceLine y={thresholds.warning} stroke="orange" strokeDasharray="3 3" />
          <ReferenceLine y={thresholds.critical} stroke="red" strokeDasharray="3 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const ResponseTimeChart = ({ data }: { data: ServerMetric[] }) => {
  return (
    <div className="rounded-md border bg-background p-4 shadow-sm dark:border-gray-800">
      <h3 className="mb-4 text-sm font-medium">Response Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={formatFullDate} />
          <Line type="monotone" dataKey="responseTime" stroke="#0088ff" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Page() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  )
}