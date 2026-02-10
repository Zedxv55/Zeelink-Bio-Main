import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://svqzqjjzvglhhjxnecnl.supabase.co"
const supabaseKey = "sb_publishable_VGwkTrFk7hQBvdO1bmIGIQ_kmtqGvMe"

export const supabase = createClient(supabaseUrl, supabaseKey)
