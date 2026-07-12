import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Muat .env (hanya berfungsi di lokal, di Vercel akan diabaikan karena sudah otomatis)
dotenv.config() 

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

// Validasi darurat agar backend tidak crash tanpa alasan yang jelas
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: SUPABASE_URL atau SUPABASE_KEY belum terpasang di Environment Variables!");
}

// Inisialisasi client Supabase
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
)