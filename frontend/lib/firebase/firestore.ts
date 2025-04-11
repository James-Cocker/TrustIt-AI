import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "./firebase"

// Save analysis result
export async function saveAnalysisResult(userId: string, content: string, result: any) {
  try {
    const docRef = await addDoc(collection(db, "analyses"), {
      userId,
      content,
      result,
      timestamp: new Date(),
      saved: false,
    })
    return docRef.id
  } catch (error) {
    console.error("Error saving analysis:", error)
    throw error
  }
}

// Get user's analysis history
export async function getUserAnalyses(userId: string) {
  try {
    const q = query(collection(db, "analyses"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error fetching analyses:", error)
    throw error
  }
}

// Save or unsave an analysis
export async function toggleSaveAnalysis(analysisId: string, saved: boolean) {
  try {
    const analysisRef = doc(db, "analyses", analysisId)
    await updateDoc(analysisRef, {
      saved,
    })
    return true
  } catch (error) {
    console.error("Error updating analysis:", error)
    throw error
  }
}

// Update user settings
export async function updateUserSettings(userId: string, settings: any) {
  try {
    // Check if settings document exists
    const q = query(collection(db, "userSettings"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      // Create new settings document
      await addDoc(collection(db, "userSettings"), {
        userId,
        ...settings,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } else {
      // Update existing settings
      const settingsDoc = querySnapshot.docs[0]
      await updateDoc(doc(db, "userSettings", settingsDoc.id), {
        ...settings,
        updatedAt: new Date(),
      })
    }

    return true
  } catch (error) {
    console.error("Error updating user settings:", error)
    throw error
  }
}

// Get user settings
export async function getUserSettings(userId: string) {
  try {
    const q = query(collection(db, "userSettings"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      // Return default settings
      return {
        overlayEnabled: true,
      }
    }

    return querySnapshot.docs[0].data()
  } catch (error) {
    console.error("Error fetching user settings:", error)
    throw error
  }
}

// Delete user data (for account deletion)
export async function deleteUserData(userId: string) {
  try {
    // Delete analyses
    const analysesQuery = query(collection(db, "analyses"), where("userId", "==", userId))
    const analysesSnapshot = await getDocs(analysesQuery)

    const deletePromises = analysesSnapshot.docs.map((doc) => deleteDoc(doc.ref))

    // Delete settings
    const settingsQuery = query(collection(db, "userSettings"), where("userId", "==", userId))
    const settingsSnapshot = await getDocs(settingsQuery)

    settingsSnapshot.docs.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref))
    })

    await Promise.all(deletePromises)
    return true
  } catch (error) {
    console.error("Error deleting user data:", error)
    throw error
  }
}
