import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
title: 'MonitorPro',
  icons: {
    icon: '/favicon.ico',
  },
description: 'System Monitor and Performance Tracker',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
