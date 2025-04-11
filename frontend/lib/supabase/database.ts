import { supabase } from "./client"

// Save analysis result
export async function saveAnalysisResult(userId: string, content: string, result: any) {
  try {
    const { data, error } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        content,
        result,
        created_at: new Date().toISOString(),
        saved: false,
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error("Error saving analysis:", error)
    throw error
  }
}

// Get user's analysis history
export async function getUserAnalyses(userId: string) {
  try {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching analyses:", error)
    throw error
  }
}

// Save or unsave an analysis
export async function toggleSaveAnalysis(analysisId: string, saved: boolean) {
  try {
    const { error } = await supabase.from("analyses").update({ saved }).eq("id", analysisId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error updating analysis:", error)
    throw error
  }
}

// Delete user data (for account deletion)
export async function deleteUserData(userId: string) {
  try {
    // Delete analyses
    const { error: analysesError } = await supabase.from("analyses").delete().eq("user_id", userId)

    if (analysesError) throw analysesError

    // Delete user settings
    const { error: settingsError } = await supabase.from("user_settings").delete().eq("user_id", userId)

    if (settingsError) throw settingsError

    return true
  } catch (error) {
    console.error("Error deleting user data:", error)
    throw error
  }
}
