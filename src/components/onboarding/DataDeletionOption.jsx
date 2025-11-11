/**
 * Data Deletion Option Component
 * Allows users to request immediate deletion of their data
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { AlertCircle, Trash2 } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { deleteAllUserConversations } from "@/services/firebase/firestore"

export function DataDeletionOption() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [error, setError] = useState(null)

  const handleDeleteData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Delete all conversations
      const result = await deleteAllUserConversations(user.uid)
      
      if (result.success) {
        setDeleted(true)
        console.log(`✅ Deleted ${result.deletedCount || 0} conversations`)
        
        // Note: In a full implementation, you would also:
        // 1. Delete onboarding application data (if user requests)
        // 2. Delete user profile (if user requests account deletion)
        // 3. Update user preferences to mark deletion requested
        // 4. Send confirmation email
        
        // For now, we'll just delete conversations as per PRD requirements
      } else {
        throw new Error(result.error || 'Failed to delete data')
      }
    } catch (err) {
      console.error('Error deleting data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (deleted) {
    return (
      <Card className="border border-border shadow-lg">
        <CardHeader>
          <CardTitle>Data Deletion Request</CardTitle>
          <CardDescription>Your data has been deleted</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Deletion Complete</AlertTitle>
            <AlertDescription>
              Your conversation data has been successfully deleted. This action cannot be undone.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border shadow-lg">
      <CardHeader>
        <CardTitle>Data Deletion</CardTitle>
        <CardDescription>Request immediate deletion of your data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Deleting your data will permanently remove all conversation history and assessment data.
            This action cannot be undone. Your account and profile information will remain, but all
            chat conversations will be deleted immediately.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>What will be deleted:</strong>
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>All conversation history</li>
            <li>All assessment data from conversations</li>
            <li>All chat messages and AI responses</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>What will NOT be deleted:</strong>
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Your account and profile</li>
            <li>Onboarding application data</li>
            <li>Insurance information</li>
            <li>Appointment records</li>
          </ul>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full" disabled={loading}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete My Conversation Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your conversation history and assessment data.
                This action cannot be undone. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes, Delete My Data"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

