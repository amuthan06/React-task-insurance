import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mlokpcrqayodxchcynec.supabase.co' // Replace with your Supabase Project URL
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sb2twY3JxYXlvZHhjaGN5bmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMzgwNzksImV4cCI6MjA2MTYxNDA3OX0.nvlMzAWOn6JSz6zTNB3vtW5oWH45cmSvKHdWNLZN0MQ' // Replace with your Anon Public Key

export const supabase = createClient(supabaseUrl, supabaseKey)
