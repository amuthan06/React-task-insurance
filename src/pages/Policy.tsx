import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  createPolicy,
  deletePolicy,
  fetchPolicies, // Added this import
  updatePolicyThunk,
} from '../features/policies/policiesSlice'
import type { Policy } from '../features/policies/policiesSlice'
import { fetchPolicyholders } from '../features/policyholders/policyholdersSlice'
import { supabase } from '../lib/supabase'
import type { AppDispatch, RootState } from '../store'
import Navbar from '../components/Navbar'

interface PolicyHolderUser {
  id: string
  email: string
}

export default function Policy() {
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
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [region, setRegion] = useState('none')
  const [policyNumber, setPolicyNumber] = useState('')
  const [policyType, setPolicyType] = useState('')
  const [coverage, setCoverage] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('Active')
  const [selectedPolicyholderId, setSelectedPolicyholderId] = useState('none')
  const [policyError, setPolicyError] = useState<string | null>(null)
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<
    'admin' | 'agent' | 'policy_holder' | null
  >(null)
  const [policyHolderUsers, setPolicyHolderUsers] = useState<
    PolicyHolderUser[]
  >([])
  const [selectedPolicyHolderUserId, setSelectedPolicyHolderUserId] =
    useState('none')
  const [fetchUsersError, setFetchUsersError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) {
        console.error('Error fetching user:', error)
        setUserRole('policy_holder') // Fallback to default role
        return
      }

      if (!user) {
        console.error('No user found in session')
        setUserRole('policy_holder') // Fallback to default role
        navigate('/login') // Redirect to login if no user
        return
      }

      console.log('Full user object:', user)
      const role = user.user_metadata?.role || 'policy_holder'
      console.log('Fetched user metadata:', user.user_metadata)
      console.log('User role set to:', role)
      setUserRole(role as 'admin' | 'agent' | 'policy_holder')
    }

    fetchUserRole()
  }, [navigate])

  useEffect(() => {
    if (userRole) {
      console.log('Fetching policyholders and policies for role:', userRole)
      dispatch(fetchPolicyholders())
      dispatch(fetchPolicies())

      const fetchPolicyHolderUsers = async () => {
        try {
          const { data, error } = await supabase.rpc('get_policy_holder_users')

          console.log('Supabase fetchPolicyHolderUsers data:', data)
          console.log('Supabase fetchPolicyHolderUsers error:', error)

          if (error) {
            console.error('Error fetching policy_holder users:', error)
            setFetchUsersError(
              error.message || 'Failed to fetch policyholder users'
            )
            setPolicyHolderUsers([])
            return
          }

          if (!data) {
            console.warn('No data returned from get_policy_holder_users')
            setPolicyHolderUsers([])
            return
          }

          const users = Array.isArray(data)
            ? data.map((user: { id: string; email: string }) => {
                console.log('Mapping user:', user)
                return {
                  id: user.id,
                  email: user.email || 'No email',
                }
              })
            : []
          console.log('Mapped policyHolderUsers:', users)
          setPolicyHolderUsers(users)
          setFetchUsersError(null)
        } catch (err) {
          console.error('Unexpected error in fetchPolicyHolderUsers:', err)
          setFetchUsersError('Unexpected error while fetching policyholder users')
          setPolicyHolderUsers([])
        }
      }

      fetchPolicyHolderUsers()
    }
  }, [dispatch, userRole])

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
  console.log('Policy Holder Users:', policyHolderUsers)

  const policyholders = rawPolicyholders
  const policies = rawPolicies

  const handleAddPolicyholder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (region === 'none') {
      alert('Please select a region.')
      return
    }
    if (selectedPolicyHolderUserId === 'none') {
      alert('Please select a policyholder to associate with.')
      return
    }
    const { error } = await supabase.from('policyholders').insert({
      name,
      contact,
      region,
      user_id: selectedPolicyHolderUserId,
    })
    if (error) {
      console.error(error)
    } else {
      setName('')
      setContact('')
      setRegion('none')
      setSelectedPolicyHolderUserId('none')
      dispatch(fetchPolicyholders())
    }
  }

  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault()
    setPolicyError(null)
    if (selectedPolicyholderId === 'none') {
      setPolicyError('Please select a policyholder.')
      return
    }
    try {
      await dispatch(
        createPolicy({
          number: policyNumber,
          type: policyType,
          coverage: Number.parseInt(coverage),
          start_date: startDate,
          end_date: endDate,
          status,
          policyholder_id: selectedPolicyholderId,
        })
      )
      setPolicyNumber('')
      setPolicyType('')
      setCoverage('')
      setStartDate('')
      setEndDate('')
      setStatus('Active')
      setSelectedPolicyholderId('none')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add policy.'
      setPolicyError(errorMessage)
      console.error('Add Policy Error:', error)
    }
  }

  const handleEditPolicy = (policy: Policy) => {
    setEditingPolicyId(policy.id)
    setPolicyNumber(policy.number)
    setPolicyType(policy.type)
    setCoverage(policy.coverage.toString())
    setStartDate(policy.start_date)
    setEndDate(policy.end_date)
    setStatus(policy.status)
    setSelectedPolicyholderId(policy.policyholder_id)
  }

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault()
    setPolicyError(null)
    if (!editingPolicyId) {
      return
    }
    if (selectedPolicyholderId === 'none' && userRole === 'admin') {
      setPolicyError('Please select a policyholder.')
      return
    }
    try {
      const updatedFields: Partial<Policy> = {}

      if (userRole === 'policy_holder') {
        updatedFields.coverage = Number.parseInt(coverage)
        updatedFields.start_date = startDate
        updatedFields.end_date = endDate
      } else if (userRole === 'agent') {
        updatedFields.status = status
      } else if (userRole === 'admin') {
        updatedFields.number = policyNumber
        updatedFields.type = policyType
        updatedFields.coverage = Number.parseInt(coverage)
        updatedFields.start_date = startDate
        updatedFields.end_date = endDate
        updatedFields.status = status
        updatedFields.policyholder_id = selectedPolicyholderId
      }

      await dispatch(
        updatePolicyThunk({
          id: editingPolicyId,
          policy: updatedFields as Omit<Policy, 'id'>,
        })
      )
      setEditingPolicyId(null)
      setPolicyNumber('')
      setPolicyType('')
      setCoverage('')
      setStartDate('')
      setEndDate('')
      setStatus('Active')
      setSelectedPolicyholderId('none')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update policy.'
      setPolicyError(errorMessage)
      console.error('Update Policy Error:', error)
    }
  }

  const handleDeletePolicy = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await dispatch(deletePolicy(id))
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete policy.'
        setPolicyError(errorMessage)
        console.error('Delete Policy Error:', error)
      }
    }
  }

  if (!userRole) {
    console.log('Rendering Loading state...')
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-6">
          <p className="text-gray-600">Loading user role...</p>
        </div>
      </div>
    )
  }

  if (phError || pError) {
    console.log('Rendering Error state...')
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-6">
          {phError && (
            <p className="text-red-500">Policyholders Error: {phError}</p>
          )}
          {pError && <p className="text-red-500">Policies Error: {pError}</p>}
        </div>
      </div>
    )
  }

  console.log('Rendering Policy Page...')

  const canAddPolicies = userRole === 'admin' || userRole === 'agent'
  const canEditLimitedFields =
    userRole === 'admin' || userRole === 'policy_holder'
  const canEditStatus = userRole === 'admin' || userRole === 'agent'
  const shouldRenderForm =
    canAddPolicies || (userRole === 'policy_holder' && editingPolicyId)

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Policy Management
          </h2>
        </div>

        {userRole === 'admin' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Policyholder</CardTitle>
            </CardHeader>
            <CardContent>
              {fetchUsersError && (
                <p className="text-red-500 mb-4">{fetchUsersError}</p>
              )}
              <form onSubmit={handleAddPolicyholder} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block mb-1 text-sm font-medium"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact"
                      className="block mb-1 text-sm font-medium"
                    >
                      Contact <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="contact"
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="region"
                      className="block mb-1 text-sm font-medium"
                    >
                      Region <span className="text-red-500">*</span>
                    </label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger id="region">
                        <SelectValue placeholder="Select Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select Region</SelectItem>
                        <SelectItem value="North">North</SelectItem>
                        <SelectItem value="South">South</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label
                      htmlFor="policyholder-under"
                      className="block mb-1 text-sm font-medium"
                    >
                      Policyholder Under <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedPolicyHolderUserId}
                      onValueChange={setSelectedPolicyHolderUserId}
                    >
                      <SelectTrigger id="policyholder-under">
                        <SelectValue placeholder="Select Policyholder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select Policyholder</SelectItem>
                        {policyHolderUsers.length === 0 && (
                          <SelectItem value="none" disabled>
                            No policyholders available
                          </SelectItem>
                        )}
                        {policyHolderUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit">Add Policyholder</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {shouldRenderForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingPolicyId ? 'Edit Policy' : 'Add Policy'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={editingPolicyId ? handleUpdatePolicy : handleAddPolicy}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="policyholder"
                      className="block mb-1 text-sm font-medium"
                    >
                      Policyholder <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedPolicyholderId}
                      onValueChange={setSelectedPolicyholderId}
                      disabled={
                        editingPolicyId &&
                        (userRole === 'agent' || userRole === 'policy_holder')
                      }
                    >
                      <SelectTrigger id="policyholder">
                        <SelectValue placeholder="Select Policyholder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select Policyholder</SelectItem>
                        {policyholders.map((ph) => (
                          <SelectItem key={ph.id} value={ph.id}>
                            {ph.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label
                      htmlFor="policy-number"
                      className="block mb-1 text-sm font-medium"
                    >
                      Policy Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="policy-number"
                      type="text"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      required
                      disabled={
                        editingPolicyId &&
                        (userRole === 'agent' || userRole === 'policy_holder')
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="policy-type"
                      className="block mb-1 text-sm font-medium"
                    >
                      Type <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="policy-type"
                      type="text"
                      value={policyType}
                      onChange={(e) => setPolicyType(e.target.value)}
                      required
                      disabled={
                        editingPolicyId &&
                        (userRole === 'agent' || userRole === 'policy_holder')
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="coverage"
                      className="block mb-1 text-sm font-medium"
                    >
                      Coverage ($) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="coverage"
                      type="number"
                      value={coverage}
                      onChange={(e) => setCoverage(e.target.value)}
                      required
                      disabled={editingPolicyId && userRole === 'agent'}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="start-date"
                      className="block mb-1 text-sm font-medium"
                    >
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      disabled={
                        editingPolicyId &&
                        (userRole === 'agent' || userRole === 'policy_holder')
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="end-date"
                      className="block mb-1 text-sm font-medium"
                    >
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      disabled={editingPolicyId && userRole === 'agent'}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="status"
                      className="block mb-1 text-sm font-medium"
                    >
                      Status <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={status}
                      onValueChange={setStatus}
                      disabled={editingPolicyId && userRole === 'policy_holder'}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {policyError && <p className="text-red-500">{policyError}</p>}
                <div className="space-x-2">
                  <Button type="submit" variant="default">
                    {editingPolicyId ? 'Update Policy' : 'Add Policy'}
                  </Button>
                  {editingPolicyId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingPolicyId(null)
                        setPolicyNumber('')
                        setPolicyType('')
                        setCoverage('')
                        setStartDate('')
                        setEndDate('')
                        setStatus('Active')
                        setSelectedPolicyholderId('none')
                        setPolicyError(null)
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {pLoading && <p className="text-gray-600">Loading policies...</p>}
        {pError && <p className="text-red-500">Policies Error: {pError}</p>}
        {!pLoading && !pError && policies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Coverage ($)</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    {(userRole === 'admin' ||
                      userRole === 'policy_holder' ||
                      userRole === 'agent') && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>{policy.number}</TableCell>
                      <TableCell>{policy.type}</TableCell>
                      <TableCell>{policy.coverage}</TableCell>
                      <TableCell>{policy.start_date}</TableCell>
                      <TableCell>{policy.end_date}</TableCell>
                      <TableCell>{policy.status}</TableCell>
                      {(userRole === 'admin' ||
                        userRole === 'policy_holder' ||
                        userRole === 'agent') && (
                        <TableCell>
                          <div className="space-x-2">
                            {(userRole === 'admin' ||
                              userRole === 'policy_holder' ||
                              userRole === 'agent') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPolicy(policy)}
                              >
                                Edit
                              </Button>
                            )}
                            {userRole === "admin" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePolicy(policy.id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        {!pLoading && !pError && policies.length === 0 && (
          <p className="text-gray-600">No policies available yet. Add a policy to get started.</p>
        )}
      </div>
    </div>
  )
}