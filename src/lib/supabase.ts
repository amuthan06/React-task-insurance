import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mlokpcrqayodxchcynec.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sb2twY3JxYXlvZHhjaGN5bmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMzgwNzksImV4cCI6MjA2MTYxNDA3OX0.nvlMzAWOn6JSz6zTNB3vtW5oWH45cmSvKHdWNLZN0MQ'

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
  if (error) {
    throw error
  }
  return data
}

export async function addCustomer(customer: {
  name: string
  email: string
  phone?: string
  address?: string
}) {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...customer,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
  if (error) {
    throw error
  }
  return data[0]
}

export async function getPolicies(customerId: string) {
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('customer_id', customerId)
  if (error) {
    throw error
  }
  return data
}

export async function addPolicy(policy: {
  customer_id: string
  policy_number: string
  type: string
  premium: number
  start_date: string
  end_date: string
}) {
  const { data, error } = await supabase
    .from('policies')
    .insert(policy)
    .select()
  if (error) {
    throw error
  }
  return data[0]
}

export async function getClaims(policyId: string) {
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('policy_id', policyId)
  if (error) {
    throw error
  }
  return data
}

export async function addClaim(claim: {
  policy_id: string
  claim_number: string
  amount: number
  status: string
  description?: string
  filed_at: string
}) {
  const { data, error } = await supabase.from('claims').insert(claim).select()
  if (error) {
    throw error
  }
  return data[0]
}
