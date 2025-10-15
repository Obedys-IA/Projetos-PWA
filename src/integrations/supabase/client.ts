import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const supabaseUrl = 'https://nwkqdbonogfitjhkjjgh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53a3FkYm9ub2dmaXRqaGtqamdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzkwNjEsImV4cCI6MjA3NTk1NTA2MX0.aw-l789QkOFmh71AdK6jYeKqXfgXFOkmNMfy5r_L0SU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)