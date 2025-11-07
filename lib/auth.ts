import { supabase } from "./supabase-client"

export interface User {
  id: string
  nickname: string
  password: string
  avatar: string
  createdAt: string
}

export interface SessionUser {
  id: string
  nickname: string
  avatar: any // Updated to accept any type for avatar
  selectedBadge?: string | null
  weeklyBadges?: number[]
  unlockedAchievements?: string[]
}

// Registrar un nuevo usuario
export async function registerUser(
  nickname: string,
  password: string,
  avatar: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validar que el nickname sea único
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("nickname", nickname.toLowerCase())
      .single()

    if (existingUser) {
      return { success: false, error: "El nickname ya está en uso" }
    }

    // Insertar nuevo usuario
    const { data, error } = await supabase
      .from("users")
      .insert({
        nickname: nickname.toLowerCase(),
        password: password,
        avatar: avatar,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error registering user:", error)
      return { success: false, error: "Error al registrar usuario" }
    }

    return { success: true }
  } catch (err) {
    console.error("Registration error:", err)
    return { success: false, error: "Error en el registro" }
  }
}

// Login de usuario
export async function loginUser(
  nickname: string,
  password: string,
): Promise<{ success: boolean; user?: SessionUser; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, nickname, avatar, selected_badge, weekly_badges, unlocked_achievements")
      .eq("nickname", nickname.toLowerCase())
      .eq("password", password)
      .single()

    if (error || !data) {
      return { success: false, error: "Nickname o contraseña inválidos" }
    }

    let parsedAvatar = data.avatar
    if (typeof data.avatar === "string") {
      try {
        parsedAvatar = JSON.parse(data.avatar)
      } catch {
        parsedAvatar = { type: "alien", bgColor: "#10b981" }
      }
    }

    // Guardar sesión en localStorage con insignia seleccionada
    const sessionUser: SessionUser = {
      id: data.id,
      nickname: data.nickname,
      avatar: parsedAvatar,
      selectedBadge: data.selected_badge || null,
      weeklyBadges: data.weekly_badges || [],
      unlockedAchievements: data.unlocked_achievements || [],
    }
    localStorage.setItem("currentUser", JSON.stringify(sessionUser))

    return { success: true, user: sessionUser }
  } catch (err) {
    console.error("Login error:", err)
    return { success: false, error: "Error en el login" }
  }
}

// Obtener usuario actual desde sesión
export function getCurrentUser(): SessionUser | null {
  try {
    const user = localStorage.getItem("currentUser")
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

// Logout
export function logoutUser(): void {
  localStorage.removeItem("currentUser")
}

export async function updateUserBadge(userId: string, selectedBadge: string | null): Promise<boolean> {
  try {
    const { error } = await supabase.from("users").update({ selected_badge: selectedBadge }).eq("id", userId)

    if (error) {
      console.error("Error updating badge:", error)
      return false
    }

    // Actualizar también en localStorage
    const currentUser = getCurrentUser()
    if (currentUser) {
      currentUser.selectedBadge = selectedBadge
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
    }

    return true
  } catch (err) {
    console.error("Error in updateUserBadge:", err)
    return false
  }
}

export async function updateUserWeeklyBadges(userId: string, weeklyBadges: number[]): Promise<boolean> {
  try {
    const { error } = await supabase.from("users").update({ weekly_badges: weeklyBadges }).eq("id", userId)

    if (error) {
      console.error("Error updating weekly badges:", error)
      return false
    }

    // Actualizar también en localStorage
    const currentUser = getCurrentUser()
    if (currentUser) {
      currentUser.weeklyBadges = weeklyBadges
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
    }

    return true
  } catch (err) {
    console.error("Error in updateUserWeeklyBadges:", err)
    return false
  }
}

export async function updateUserAchievements(userId: string, achievements: string[]): Promise<boolean> {
  try {
    const { error } = await supabase.from("users").update({ unlocked_achievements: achievements }).eq("id", userId)

    if (error) {
      console.error("Error updating achievements:", error)
      return false
    }

    const currentUser = getCurrentUser()
    if (currentUser) {
      currentUser.unlockedAchievements = achievements
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
    }

    return true
  } catch (err) {
    console.error("Error in updateUserAchievements:", err)
    return false
  }
}
