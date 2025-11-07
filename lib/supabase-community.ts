import { supabase } from "./supabase-client"

// Tipos
export interface SharedHabit {
  id: string
  user_id: string
  user_nickname: string
  user_avatar: {
    type: string
    color: string
  }
  category: string
  description?: string
  image_url?: string
  created_at: string
  checks: string[]
  comments: Array<{
    user: string
    text: string
    timestamp: string
  }>
  verified: boolean
}

export interface SharedReport {
  id: string
  user_id: string
  user_nickname: string
  user_avatar: {
    type: string
    color: string
  }
  location: string
  description?: string
  image_url: string
  created_at: string
  checks: string[]
  comments: Array<{
    user: string
    text: string
    timestamp: string
  }>
  resolution_evidences: Array<{
    user: string
    image_url: string
    description?: string
    checks: string[]
    timestamp: string
  }>
  resolved: boolean
  verified: boolean
}

// Subir imagen a Supabase Storage
export async function uploadCommunityImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage.from("community-images").upload(filePath, file)

    if (uploadError) {
      console.error("Error uploading image:", uploadError)
      return null
    }

    const { data } = supabase.storage.from("community-images").getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Error in uploadCommunityImage:", error)
    return null
  }
}

// HÁBITOS COMPARTIDOS

export async function createSharedHabit(
  habit: Omit<SharedHabit, "id" | "created_at" | "checks" | "comments" | "verified">,
) {
  const { data, error } = await supabase.from("shared_habits").insert([habit]).select().single()

  if (error) {
    console.error("Error creating shared habit:", error)
    return null
  }

  return data as SharedHabit
}

export async function getSharedHabits(): Promise<SharedHabit[]> {
  const { data, error } = await supabase.from("shared_habits").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching shared habits:", error)
    return []
  }

  return data as SharedHabit[]
}

export async function addCheckToHabit(habitId: string, userNickname: string) {
  const { data: habit } = await supabase.from("shared_habits").select("checks").eq("id", habitId).single()

  if (!habit) return false

  const checks = habit.checks as string[]
  if (checks.includes(userNickname)) return false

  const newChecks = [...checks, userNickname]
  const verified = newChecks.length >= 3

  const { error } = await supabase.from("shared_habits").update({ checks: newChecks, verified }).eq("id", habitId)

  if (verified) {
    // Eliminar hábito si está verificado
    await supabase.from("shared_habits").delete().eq("id", habitId)
  }

  return !error
}

export async function addCommentToHabit(habitId: string, comment: { user: string; text: string; timestamp: string }) {
  const { data: habit } = await supabase.from("shared_habits").select("comments").eq("id", habitId).single()

  if (!habit) return false

  const comments = habit.comments as any[]
  const newComments = [...comments, comment]

  const { error } = await supabase.from("shared_habits").update({ comments: newComments }).eq("id", habitId)

  return !error
}

export async function deleteSharedHabit(habitId: string, userId: string) {
  const { error } = await supabase.from("shared_habits").delete().eq("id", habitId).eq("user_id", userId)

  return !error
}

// REPORTES COMPARTIDOS

export async function createSharedReport(
  report: Omit<
    SharedReport,
    "id" | "created_at" | "checks" | "comments" | "resolution_evidences" | "resolved" | "verified"
  >,
) {
  const { data, error } = await supabase.from("shared_reports").insert([report]).select().single()

  if (error) {
    console.error("Error creating shared report:", error)
    return null
  }

  return data as SharedReport
}

export async function getSharedReports(): Promise<SharedReport[]> {
  const { data, error } = await supabase.from("shared_reports").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching shared reports:", error)
    return []
  }

  return data as SharedReport[]
}

export async function addCheckToReport(reportId: string, userNickname: string) {
  const { data: report } = await supabase.from("shared_reports").select("checks").eq("id", reportId).single()

  if (!report) return false

  const checks = report.checks as string[]
  if (checks.includes(userNickname)) return false

  const newChecks = [...checks, userNickname]
  const { error } = await supabase.from("shared_reports").update({ checks: newChecks }).eq("id", reportId)

  return !error
}

export async function addCommentToReport(reportId: string, comment: { user: string; text: string; timestamp: string }) {
  const { data: report } = await supabase.from("shared_reports").select("comments").eq("id", reportId).single()

  if (!report) return false

  const comments = report.comments as any[]
  const newComments = [...comments, comment]

  const { error } = await supabase.from("shared_reports").update({ comments: newComments }).eq("id", reportId)

  return !error
}

export async function addResolutionEvidence(
  reportId: string,
  evidence: { user: string; image_url: string; description?: string; checks: string[]; timestamp: string },
) {
  const { data: report } = await supabase
    .from("shared_reports")
    .select("resolution_evidences")
    .eq("id", reportId)
    .single()

  if (!report) return false

  const evidences = report.resolution_evidences as any[]
  const newEvidences = [...evidences, evidence]

  const { error } = await supabase
    .from("shared_reports")
    .update({ resolution_evidences: newEvidences })
    .eq("id", reportId)

  return !error
}

export async function addCheckToResolutionEvidence(reportId: string, evidenceIndex: number, userNickname: string) {
  const { data: report } = await supabase
    .from("shared_reports")
    .select("resolution_evidences")
    .eq("id", reportId)
    .single()

  if (!report) return false

  const evidences = report.resolution_evidences as any[]
  if (!evidences[evidenceIndex]) return false

  const evidence = evidences[evidenceIndex]
  if (evidence.checks.includes(userNickname)) return false

  evidence.checks.push(userNickname)
  evidences[evidenceIndex] = evidence

  const resolved = evidence.checks.length >= 3

  const { error } = await supabase
    .from("shared_reports")
    .update({ resolution_evidences: evidences, resolved })
    .eq("id", reportId)

  if (resolved) {
    // Eliminar reporte si está resuelto
    await supabase.from("shared_reports").delete().eq("id", reportId)
  }

  return !error
}

export async function deleteSharedReport(reportId: string, userId: string) {
  const { error } = await supabase.from("shared_reports").delete().eq("id", reportId).eq("user_id", userId)

  return !error
}
