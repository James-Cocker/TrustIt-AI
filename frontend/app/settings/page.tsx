"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const [overlayEnabled, setOverlayEnabled] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, loading, signOut, deleteAccount } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    // Fetch user settings from Supabase
    const fetchUserSettings = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("overlay_enabled")
          .eq("user_id", user.id)
          .single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows returned" error
          throw error
        }

        if (data) {
          setOverlayEnabled(data.overlay_enabled)
        }
      } catch (error) {
        console.error("Error fetching user settings:", error)
      }
    }

    fetchUserSettings()
  }, [user, loading, router])

  const handleOverlayToggle = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const newValue = !overlayEnabled

      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (existingSettings) {
        // Update existing settings
        await supabase.from("user_settings").update({ overlay_enabled: newValue }).eq("user_id", user.id)
      } else {
        // Insert new settings
        await supabase.from("user_settings").insert({ user_id: user.id, overlay_enabled: newValue })
      }

      setOverlayEnabled(newValue)
      toast({
        title: `Website overlay ${newValue ? "enabled" : "disabled"}`,
        description: `You have ${newValue ? "enabled" : "disabled"} the website overlay feature.`,
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Failed to update settings",
        description: "There was an error updating your settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)

    try {
      await deleteAccount()
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Failed to delete account",
        description: "There was an error deleting your account. Please try again.",
        variant: "destructive",
      })
      setIsDeleteDialogOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Website Overlay</CardTitle>
            <CardDescription>
              Enable or disable the website overlay that highlights potential misinformation while browsing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="overlay-mode"
                checked={overlayEnabled}
                onCheckedChange={handleOverlayToggle}
                disabled={isLoading}
              />
              <Label htmlFor="overlay-mode">{overlayEnabled ? "Enabled" : "Disabled"}</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>Manage your account settings and data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              Delete Account
            </Button>
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
