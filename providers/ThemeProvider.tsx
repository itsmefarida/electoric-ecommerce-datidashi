// providers/ThemeProvider.tsx
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
// --- PERBAIKAN DI SINI ---
// Impor 'ThemeProviderProps' langsung dari 'next-themes', bukan 'next-themes/dist/types'
import { type ThemeProviderProps } from 'next-themes'
// --- BATAS PERBAIKAN ---

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}