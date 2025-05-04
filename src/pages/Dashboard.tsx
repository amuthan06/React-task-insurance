import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import CoverageOverTimeChart from '../components/CoverageOverTimeChart'
import Navbar from '../components/Navbar'
import PolicyCountByTypeAndStatusChart from '../components/PolicyCountByTypeAndStatusChart'
import PolicyDistributionByRegionChart from '../components/PolicyDistributionByRegionChart'
import PolicyholdersBasedOnRegionChart from '../components/PolicyholdersBasedOnRegionChart'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { fetchPolicies } from '../features/policies/policiesSlice'
import { fetchPolicyholders } from '../features/policyholders/policyholdersSlice'
import { supabase } from '../lib/supabase'
import type { AppDispatch, RootState } from '../store'

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    list: rawPolicyholders,
    loading: phLoading,
    error: phError,
  } = useSelector((state: RootState) => state.policyholders)
  const {
    list: rawPolicies,
    loading: pLoading,
    error: pError,
  } = useSelector((state: RootState) => state.policies)
  const _navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('none')
  const [regionFilter, setRegionFilter] = useState('none')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [userRole, setUserRole] = useState<
    'admin' | 'agent' | 'policy_holder' | null
  >(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) {
        console.error('Error fetching user:', error)
        setUserRole('policy_holder')
        return
      }

      if (!user) {
        console.error('No user found in session')
        setUserRole('policy_holder')
        return
      }

      console.log('Full user object:', user)
      const role = user.user_metadata?.role || 'policy_holder'
      console.log('Fetched user metadata:', user.user_metadata)
      console.log('User role set to:', role)
      setUserRole(role as 'admin' | 'agent' | 'policy_holder')
    }

    fetchUserRole()
  }, [])

  useEffect(() => {
    dispatch(fetchPolicyholders())
    dispatch(fetchPolicies())
  }, [dispatch])

  console.log('User Role:', userRole)
  console.log(
    'Policyholders Loading:',
    phLoading,
    'Error:',
    phError,
    'Data:',
    rawPolicyholders
  )
  console.log(
    'Policies Loading:',
    pLoading,
    'Error:',
    pError,
    'Data:',
    rawPolicies
  )

  const policyholders =
    regionFilter !== 'none'
      ? rawPolicyholders.filter((ph) => ph.region === regionFilter)
      : rawPolicyholders

  const policies = rawPolicies.filter((policy) => {
    const matchesStatus =
      statusFilter !== 'none' ? policy.status === statusFilter : true
    const policyholder = rawPolicyholders.find(
      (ph) => ph.id === policy.policyholder_id
    )
    const matchesRegion =
      regionFilter !== 'none' && policyholder
        ? policyholder.region === regionFilter
        : true
    const matchesDateRange =
      dateRange.start && dateRange.end
        ? policy.start_date <= dateRange.end &&
          policy.end_date >= dateRange.start
        : true

    return matchesStatus && matchesRegion && matchesDateRange
  })

  if (!userRole) {
    console.log('Rendering Loading state...')
    return <div>Loading...</div>
  }

  if (phError || pError) {
    console.log('Rendering Error state...')
    return (
      <div className="p-6">
        {phError && (
          <p className="text-red-500">Policyholders Error: {phError}</p>
        )}
        {pError && <p className="text-red-500">Policies Error: {pError}</p>}
      </div>
    )
  }

  console.log('Rendering Main Dashboard...')

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label
                  htmlFor="status-filter"
                  className="block mb-1 text-sm font-medium"
                >
                  Policy Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  htmlFor="region-filter"
                  className="block mb-1 text-sm font-medium"
                >
                  Region
                </label>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger id="region-filter">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Regions</SelectItem>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <p className="block mb-1 text-sm font-medium">Date Range</p>
                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                  <div className="w-full min-w-[150px]">
                    <label htmlFor="date-start" className="sr-only">
                      Start Date
                    </label>
                    <Input
                      id="date-start"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                    />
                  </div>
                  <div className="w-full min-w-[150px]">
                    <label htmlFor="date-end" className="sr-only">
                      End Date
                    </label>
                    <Input
                      id="date-end"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <PolicyholdersBasedOnRegionChart policyholders={policyholders} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <PolicyCountByTypeAndStatusChart policies={policies} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <CoverageOverTimeChart policies={policies} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <PolicyDistributionByRegionChart
                policies={policies}
                policyholders={policyholders}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
