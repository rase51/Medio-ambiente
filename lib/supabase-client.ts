import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://zgdpukvvhxggynlaqygh.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZHB1a3Z2aHhnZ3lubGFxeWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzOTExNjEsImV4cCI6MjA3Nzk2NzE2MX0.d-vCVy0o1dnslRXHsg7QDc2EOSLrVP6XWc4Smh5EB9k"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
