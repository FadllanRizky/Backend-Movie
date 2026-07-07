import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Muat variabel lingkungan dari file .env
dotenv.config() 

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

// Inisialisasi client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)