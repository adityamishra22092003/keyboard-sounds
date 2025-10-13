"use client"

import { useEffect, useRef, useState } from "react"
import { KeyboardSounds, type KeyboardSoundsConfig } from "@/lib/keyboard-sounds"

export function useKeyboardSounds(config: KeyboardSoundsConfig = {}) {
  const [isEnabled, setIsEnabled] = useState(false)
  const keyboardSoundsRef = useRef<KeyboardSounds | null>(null)

  // Initialize KeyboardSounds instance
  useEffect(() => {
    keyboardSoundsRef.current = new KeyboardSounds(config)

    return () => {
      if (keyboardSoundsRef.current) {
        keyboardSoundsRef.current.disable()
      }
    }
  }, []) // Only run once on mount

  // Update config when it changes
  useEffect(() => {
    if (keyboardSoundsRef.current) {
      keyboardSoundsRef.current.updateConfig(config)
    }
  }, [config])

  const enable = async () => {
    if (!keyboardSoundsRef.current) return

    try {
      await keyboardSoundsRef.current.enable()
      setIsEnabled(true)
    } catch (error) {
      console.error("Failed to enable keyboard sounds:", error)
      setIsEnabled(false)
    }
  }

  const disable = () => {
    if (!keyboardSoundsRef.current) return

    keyboardSoundsRef.current.disable()
    setIsEnabled(false)
  }

  const playSound = (key: string) => {
    if (!keyboardSoundsRef.current || !isEnabled) return
    keyboardSoundsRef.current.playSound(key)
  }

  const updateConfig = (newConfig: Partial<KeyboardSoundsConfig>) => {
    if (!keyboardSoundsRef.current) return
    keyboardSoundsRef.current.updateConfig(newConfig)
  }

  return {
    enable,
    disable,
    playSound,
    updateConfig,
    isEnabled,
  }
}
