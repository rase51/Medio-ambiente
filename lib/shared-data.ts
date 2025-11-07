export interface SharedHabit {
  id: string
  userId: string
  nickname: string
  userAvatar: { type: string; bgColor: string }
  category: string
  description: string
  quantity: number
  streak: number
  createdAt: string
  evidence?: Array<{
    image: string
    description: string
    date: string
    verificationCount: number
    verifiedBy: string[]
  }>
  verified: boolean
  verificationCount: number
  verifiedBy: string[]
  shared: boolean
  selectedBadge?: string
}

export interface SharedReport {
  id: string
  userId: string
  nickname: string
  userAvatar: { type: string; bgColor: string }
  title: string
  priority: string
  location: string
  description?: string
  createdAt: string
  image: string
  verified: boolean
  verificationCount: number
  verifiedBy: string[]
  evidence?: Array<{
    image: string
    description: string
    date: string
    verificationCount: number
    verifiedBy: string[]
  }>
  comments: Array<{ userId: string; nickname: string; text: string; date: string }>
  shared: boolean
  selectedBadge?: string
}

export const VERIFICATION_THRESHOLD = 3

// Obtener datos compartidos
export function getSharedCommunityData() {
  try {
    const data = localStorage.getItem("residuos_community")
    return data ? JSON.parse(data) : { habits: [], reports: [] }
  } catch {
    return { habits: [], reports: [] }
  }
}

// Guardar datos compartidos
export function saveSharedCommunityData(data: { habits: SharedHabit[]; reports: SharedReport[] }) {
  localStorage.setItem("residuos_community", JSON.stringify(data))
}

// Agregar hábito compartido
export function addSharedHabit(habit: SharedHabit) {
  const data = getSharedCommunityData()
  data.habits.push(habit)
  saveSharedCommunityData(data)
}

// Agregar reporte compartido
export function addSharedReport(report: SharedReport) {
  const data = getSharedCommunityData()
  data.reports.push(report)
  saveSharedCommunityData(data)
}

// Verificar hábito (agregar check)
export function verifySharedHabit(habitId: string, userId: string) {
  const data = getSharedCommunityData()
  const habit = data.habits.find((h: SharedHabit) => h.id === habitId)
  if (habit && !habit.verifiedBy.includes(userId)) {
    habit.verifiedBy.push(userId)
    habit.verificationCount = habit.verifiedBy.length
    habit.verified = habit.verificationCount >= VERIFICATION_THRESHOLD
    saveSharedCommunityData(data)
  }
  return habit
}

// Verificar reporte (agregar check)
export function verifySharedReport(reportId: string, userId: string) {
  const data = getSharedCommunityData()
  const report = data.reports.find((r: SharedReport) => r.id === reportId)
  if (report && !report.verifiedBy.includes(userId)) {
    report.verifiedBy.push(userId)
    report.verificationCount = report.verifiedBy.length
    report.verified = report.verificationCount >= VERIFICATION_THRESHOLD
    saveSharedCommunityData(data)
  }
  return report
}

// Agregar comentario a reporte
export function addCommentToReport(reportId: string, userId: string, nickname: string, text: string) {
  const data = getSharedCommunityData()
  const report = data.reports.find((r: SharedReport) => r.id === reportId)
  if (report) {
    report.comments.push({
      userId,
      nickname,
      text,
      date: new Date().toISOString(),
    })
    saveSharedCommunityData(data)
  }
  return report
}

// Remover verificación de hábito
export function unverifySharedHabit(habitId: string, userId: string) {
  const data = getSharedCommunityData()
  const habit = data.habits.find((h: SharedHabit) => h.id === habitId)
  if (habit) {
    habit.verifiedBy = habit.verifiedBy.filter((id) => id !== userId)
    habit.verificationCount = habit.verifiedBy.length
    habit.verified = habit.verificationCount >= VERIFICATION_THRESHOLD
    saveSharedCommunityData(data)
  }
  return habit
}

// Remover verificación de reporte
export function unverifySharedReport(reportId: string, userId: string) {
  const data = getSharedCommunityData()
  const report = data.reports.find((r: SharedReport) => r.id === reportId)
  if (report) {
    report.verifiedBy = report.verifiedBy.filter((id) => id !== userId)
    report.verificationCount = report.verifiedBy.length
    report.verified = report.verificationCount >= VERIFICATION_THRESHOLD
    saveSharedCommunityData(data)
  }
  return report
}
