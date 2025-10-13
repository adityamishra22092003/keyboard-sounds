"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Keyboard, Volume2, Play, Pause } from "lucide-react"
import { KeyboardSounds, type SoundPack, type PlayMode } from "@/lib/keyboard-sounds"
import { useKeyboardSounds } from "@/hooks/use-keyboard-sounds"

const soundPacks: { value: SoundPack; label: string; description: string }[] = [
  { value: "typewriter", label: "Typewriter", description: "Classic mechanical clicks" },
  { value: "piano", label: "Piano", description: "Musical piano notes" },
  { value: "retro", label: "Retro Game", description: "8-bit beeps and boops" },
  { value: "scifi", label: "Sci-Fi", description: "Futuristic laser sounds" },
  { value: "drums", label: "Drum Kit", description: "Percussion sounds" },
]

const playModes: { value: PlayMode; label: string; description: string }[] = [
  { value: "everyKey", label: "Every Key", description: "Sound on each keystroke" },
  { value: "wordEnd", label: "Word End", description: "Sound after space/enter" },
  { value: "custom", label: "Custom", description: "Developer-defined triggers" },
]

export default function Home() {
  const [soundPack, setSoundPack] = useState<SoundPack>("typewriter")
  const [playMode, setPlayMode] = useState<PlayMode>("everyKey")
  const [volume, setVolume] = useState([0.5])
  const [randomize, setRandomize] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [keyboardSounds, setKeyboardSounds] = useState<KeyboardSounds | null>(null)
  const [demoText, setDemoText] = useState("Type here to test the keyboard sounds! Try different packs and modes.")

  // Initialize keyboard sounds
  useEffect(() => {
    const ks = new KeyboardSounds({
      soundPack,
      playMode,
      volume: volume[0],
      randomize,
    })
    setKeyboardSounds(ks)

    if (isEnabled) {
      ks.enable()
    }

    return () => ks.disable()
  }, [soundPack, playMode, volume, randomize, isEnabled])

  const handleEnable = async () => {
    if (!keyboardSounds) return

    try {
      await keyboardSounds.enable()
      setIsEnabled(true)
    } catch (error) {
      console.error("Failed to enable keyboard sounds:", error)
    }
  }

  const handleDisable = () => {
    if (!keyboardSounds) return
    keyboardSounds.disable()
    setIsEnabled(false)
  }

  const playTestSound = () => {
    if (!keyboardSounds || !isEnabled) return
    keyboardSounds.playSound("a")
  }

  // Custom hook demo
  const {
    enable: hookEnable,
    disable: hookDisable,
    isEnabled: hookEnabled,
  } = useKeyboardSounds({
    soundPack: "piano",
    playMode: "everyKey",
    volume: 0.3,
    randomize: true,
  })

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Keyboard className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Keyboard Sounds 🎹</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Add delightful audio feedback to your typing experience. Choose from typewriter clicks, piano notes, retro
            game sounds, sci-fi effects, and drum kits.
          </p>
        </div>

        {/* Demo Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Sound Configuration
              </CardTitle>
              <CardDescription>Customize your keyboard sound experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sound Pack */}
              <div className="space-y-2">
                <Label>Sound Pack</Label>
                <Select value={soundPack} onValueChange={(value: SoundPack) => setSoundPack(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {soundPacks.map((pack) => (
                      <SelectItem key={pack.value} value={pack.value}>
                        <div>
                          <div className="font-medium">{pack.label}</div>
                          <div className="text-sm text-muted-foreground">{pack.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Play Mode */}
              <div className="space-y-2">
                <Label>Play Mode</Label>
                <Select value={playMode} onValueChange={(value: PlayMode) => setPlayMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {playModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        <div>
                          <div className="font-medium">{mode.label}</div>
                          <div className="text-sm text-muted-foreground">{mode.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <Label>Volume: {Math.round(volume[0] * 100)}%</Label>
                <Slider value={volume} onValueChange={setVolume} max={1} step={0.1} className="w-full" />
              </div>

              {/* Randomize */}
              <div className="flex items-center space-x-2">
                <Switch id="randomize" checked={randomize} onCheckedChange={setRandomize} />
                <Label htmlFor="randomize">Randomize sounds</Label>
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                {!isEnabled ? (
                  <Button onClick={handleEnable} className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Enable Sounds
                  </Button>
                ) : (
                  <Button onClick={handleDisable} variant="outline" className="flex-1 bg-transparent">
                    <Pause className="h-4 w-4 mr-2" />
                    Disable Sounds
                  </Button>
                )}
                <Button onClick={playTestSound} variant="outline" disabled={!isEnabled}>
                  Test
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <Badge variant="secondary" className="mb-2">
                  Status
                </Badge>
                <p>{isEnabled ? "Keyboard sounds are active!" : 'Click "Enable Sounds" to activate'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Area */}
          <Card>
            <CardHeader>
              <CardTitle>Try It Out</CardTitle>
              <CardDescription>Type in the text area below to test the sounds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                placeholder="Start typing to hear the sounds..."
                className="min-h-[200px] text-base"
                disabled={!isEnabled}
              />

              {!isEnabled && (
                <p className="text-sm text-muted-foreground">Enable sounds above to start typing with audio feedback</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* React Hook Demo */}
        <Card>
          <CardHeader>
            <CardTitle>React Hook Demo</CardTitle>
            <CardDescription>Using the useKeyboardSounds hook with piano sounds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {!hookEnabled ? (
                <Button onClick={hookEnable} variant="secondary">
                  Enable Hook Demo
                </Button>
              ) : (
                <Button onClick={hookDisable} variant="outline">
                  Disable Hook Demo
                </Button>
              )}
              <Badge variant={hookEnabled ? "default" : "secondary"}>{hookEnabled ? "Active" : "Inactive"}</Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>This demonstrates the React hook with different settings (piano sounds, randomized).</p>
              <p>Both instances can run simultaneously with different configurations.</p>
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>How to use the keyboard-sounds library in your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Badge className="mb-2">Vanilla JS</Badge>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                  {`import { KeyboardSounds } from './lib/keyboard-sounds'

const sounds = new KeyboardSounds({
  soundPack: 'typewriter',
  playMode: 'everyKey',
  volume: 0.7,
  randomize: false
})

await sounds.enable() // Enable keyboard listening
sounds.disable()     // Disable when done`}
                </pre>
              </div>

              <div>
                <Badge className="mb-2">React Hook</Badge>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                  {`import { useKeyboardSounds } from './hooks/use-keyboard-sounds'

const { enable, disable, isEnabled } = useKeyboardSounds({
  soundPack: 'piano',
  playMode: 'everyKey',
  volume: 0.5,
  randomize: true
})`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
