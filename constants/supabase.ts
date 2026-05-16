import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lcbuftqmkzwunkoszzrj.supabase.co'
const supabaseKey = 'sb_publishable__RcLpbNrOh9pglyqlJweYg_6QOw2cbp'

export const supabase = createClient(supabaseUrl, supabaseKey)