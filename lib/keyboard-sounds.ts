export type SoundPack = "typewriter" | "piano" | "retro" | "scifi" | "drums"
export type PlayMode = "everyKey" | "wordEnd" | "custom"

export interface KeyboardSoundsConfig {
  soundPack?: SoundPack
  playMode?: PlayMode
  volume?: number
  randomize?: boolean
  customTriggers?: string[]
}

export class KeyboardSounds {
  private audioContext: AudioContext | null = null
  private isEnabled = false
  private config: Required<KeyboardSoundsConfig>
  private keydownHandler: (event: KeyboardEvent) => void
  private lastWordEndTime = 0

  constructor(config: KeyboardSoundsConfig = {}) {
    this.config = {
      soundPack: config.soundPack || "typewriter",
      playMode: config.playMode || "everyKey",
      volume: config.volume || 0.5,
      randomize: config.randomize || false,
      customTriggers: config.customTriggers || [],
    }

    // Bind the handler to maintain context
    this.keydownHandler = this.handleKeydown.bind(this)
  }

  async enable(): Promise<void> {
    if (typeof window === "undefined") return // SSR safety

    try {
      // Initialize AudioContext (user gesture required for Safari)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume()
      }

      // Add event listener
      document.addEventListener("keydown", this.keydownHandler)
      this.isEnabled = true
    } catch (error) {
      console.error("Failed to enable keyboard sounds:", error)
      throw error
    }
  }

  disable(): void {
    if (typeof window === "undefined") return

    document.removeEventListener("keydown", this.keydownHandler)
    this.isEnabled = false

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }

  updateConfig(newConfig: Partial<KeyboardSoundsConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  playSound(key: string): void {
    if (!this.audioContext || !this.isEnabled) return

    try {
      const frequency = this.getFrequency(key)
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // Configure oscillator based on sound pack
      this.configureOscillator(oscillator, frequency)

      // Configure volume envelope
      const now = this.audioContext.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(this.config.volume, now + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + this.getSoundDuration())

      oscillator.start(now)
      oscillator.stop(now + this.getSoundDuration())
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase()

    switch (this.config.playMode) {
      case "everyKey":
        if (!event.metaKey && !event.ctrlKey && !event.altKey) {
          this.playSound(key)
        }
        break

      case "wordEnd":
        if (key === " " || key === "enter") {
          const now = Date.now()
          if (now - this.lastWordEndTime > 100) {
            // Debounce
            this.playSound(key)
            this.lastWordEndTime = now
          }
        }
        break

      case "custom":
        if (this.config.customTriggers.includes(key)) {
          this.playSound(key)
        }
        break
    }
  }

  private getFrequency(key: string): number {
    // Base frequencies for different sound packs
    const baseFreq = this.getBaseFrequency(key)

    if (this.config.randomize) {
      // Add some randomization (±20%)
      const variation = 0.8 + Math.random() * 0.4
      return baseFreq * variation
    }

    return baseFreq
  }

  private getBaseFrequency(key: string): number {
    // Convert key to a consistent frequency
    const keyCode = key.charCodeAt(0)

    switch (this.config.soundPack) {
      case "typewriter":
        return 800 + (keyCode % 10) * 50 // 800-1300 Hz range

      case "piano":
        // Map to piano notes (C4 to C6)
        const noteIndex = keyCode % 24
        return 261.63 * Math.pow(2, noteIndex / 12) // C4 = 261.63 Hz

      case "retro":
        return 200 + (keyCode % 20) * 100 // 200-2200 Hz range

      case "scifi":
        return 400 + (keyCode % 15) * 200 // 400-3400 Hz range

      case "drums":
        return 60 + (keyCode % 8) * 40 // 60-340 Hz range (lower frequencies)

      default:
        return 440 // Default A4
    }
  }

  private configureOscillator(oscillator: OscillatorNode, frequency: number): void {
    oscillator.frequency.setValueAtTime(frequency, this.audioContext!.currentTime)

    switch (this.config.soundPack) {
      case "typewriter":
        oscillator.type = "square"
        break

      case "piano":
        oscillator.type = "triangle"
        break

      case "retro":
        oscillator.type = "square"
        break

      case "scifi":
        oscillator.type = "sawtooth"
        // Add frequency sweep for sci-fi effect
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.7, this.audioContext!.currentTime + 0.1)
        break

      case "drums":
        oscillator.type = "triangle"
        // Quick frequency drop for drum-like effect
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.1, this.audioContext!.currentTime + 0.05)
        break

      default:
        oscillator.type = "sine"
    }
  }

  private getSoundDuration(): number {
    switch (this.config.soundPack) {
      case "typewriter":
        return 0.1
      case "piano":
        return 0.3
      case "retro":
        return 0.15
      case "scifi":
        return 0.2
      case "drums":
        return 0.08
      default:
        return 0.1
    }
  }

  get enabled(): boolean {
    return this.isEnabled
  }
}
