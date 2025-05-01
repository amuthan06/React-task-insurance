import { useState, useEffect } from 'react'
import {
  supabase,
  getCustomers,
  getPolicies,
  getClaims,
  addCustomer,
  addPolicy,
  addClaim,
} from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
}
interface Policy {
  id: string
  customer_id: string
  policy_number: string
  type: string
  premium: number
  start_date: string
  end_date: string
}
interface Claim {
  id: string
  policy_id: string
  claim_number: string
  amount: number
  status: string
  description?: string
  filed_at: string
}

function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false)
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await getCustomers()
      setCustomers(data)
    }
    fetchCustomers()
  }, [])

  // Fetch policies when a customer is selected and reset claims/selectedPolicy
  useEffect(() => {
    if (selectedCustomer) {
      const fetchPolicies = async () => {
        const data = await getPolicies(selectedCustomer)
        setPolicies(data)
      }
      fetchPolicies()
      // Reset claims and selectedPolicy when switching customers
      setClaims([])
      setSelectedPolicy(null)
    } else {
      setPolicies([])
      setClaims([])
      setSelectedPolicy(null)
    }
  }, [selectedCustomer])

  // Fetch claims when a policy is selected
  useEffect(() => {
    if (selectedPolicy) {
      const fetchClaims = async () => {
        const data = await getClaims(selectedPolicy)
        setClaims(data)
      }
      fetchClaims()
    } else {
      setClaims([])
    }
  }, [selectedPolicy])

  const handleAddCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newCustomer = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
    }
    const addedCustomer = await addCustomer(newCustomer)
    setCustomers([...customers, addedCustomer])
    // Close the dialog
    setIsCustomerDialogOpen(false)
  }

  const handleAddPolicy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCustomer) {
      return
    } // Guard clause to avoid null
    const formData = new FormData(e.currentTarget)
    const newPolicy = {
      customer_id: selectedCustomer,
      policy_number: formData.get('policy_number') as string,
      type: formData.get('type') as string,
      premium: Number(formData.get('premium')),
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
    }
    const addedPolicy = await addPolicy(newPolicy)
    setPolicies([...policies, addedPolicy])
    // Close the dialog
    setIsPolicyDialogOpen(false)
  }

  const handleAddClaim = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPolicy) {
      return
    } // Guard clause to avoid null
    const formData = new FormData(e.currentTarget)
    const newClaim = {
      policy_id: selectedPolicy,
      claim_number: formData.get('claim_number') as string,
      amount: Number(formData.get('amount')),
      status: formData.get('status') as string,
      description: formData.get('description') as string,
      filed_at: formData.get('filed_at') as string,
    }
    const addedClaim = await addClaim(newClaim)
    setClaims([...claims, addedClaim])
    // Close the dialog
    setIsClaimDialogOpen(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Insurance Dashboard</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </div>

      {/* Add Customer */}
      <Dialog
        open={isCustomerDialogOpen}
        onOpenChange={setIsCustomerDialogOpen}
      >
        <DialogTrigger asChild>
          <Button className="mb-4">Add Customer</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCustomer} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <Input id="name" name="name" placeholder="Name" required />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone
              </label>
              <Input id="phone" name="phone" placeholder="Phone" />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <Input id="address" name="address" placeholder="Address" />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customers Table */}
      <h2 className="text-2xl font-semibold mb-2">Customers</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow
              key={customer.id}
              onClick={() => setSelectedCustomer(customer.id)}
              className={selectedCustomer === customer.id ? 'bg-gray-200' : ''}
            >
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone || '-'}</TableCell>
              <TableCell>{customer.address || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Policy */}
      {selectedCustomer && (
        <>
          <Dialog
            open={isPolicyDialogOpen}
            onOpenChange={setIsPolicyDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="mt-4 mb-4">Add Policy</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Policy</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPolicy} className="space-y-4">
                <div>
                  <label
                    htmlFor="policy_number"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Policy Number
                  </label>
                  <Input
                    id="policy_number"
                    name="policy_number"
                    placeholder="Policy Number"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Type
                  </label>
                  <Select name="type" defaultValue="Health">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Auto">Auto</SelectItem>
                      <SelectItem value="Home">Home</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="premium"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Premium
                  </label>
                  <Input
                    id="premium"
                    name="premium"
                    type="number"
                    placeholder="Premium"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="end_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date
                  </label>
                  <Input id="end_date" name="end_date" type="date" required />
                </div>
                <Button type="submit">Add</Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Policies Table */}
          <h2 className="text-2xl font-semibold mb-2">Policies</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow
                  key={policy.id}
                  onClick={() => setSelectedPolicy(policy.id)}
                  className={selectedPolicy === policy.id ? 'bg-gray-200' : ''}
                >
                  <TableCell>{policy.policy_number}</TableCell>
                  <TableCell>{policy.type}</TableCell>
                  <TableCell>{policy.premium}</TableCell>
                  <TableCell>{policy.start_date}</TableCell>
                  <TableCell>{policy.end_date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* Add Claim */}
      {selectedPolicy && (
        <>
          <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 mb-4">Add Claim</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Claim</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddClaim} className="space-y-4">
                <div>
                  <label
                    htmlFor="claim_number"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Claim Number
                  </label>
                  <Input
                    id="claim_number"
                    name="claim_number"
                    placeholder="Claim Number"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Amount
                  </label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="Amount"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <Select name="status" defaultValue="Pending">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Description"
                  />
                </div>
                <div>
                  <label
                    htmlFor="filed_at"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Filed At
                  </label>
                  <Input id="filed_at" name="filed_at" type="date" required />
                </div>
                <Button type="submit">Add</Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Claims Table */}
          <h2 className="text-2xl font-semibold mb-2">Claims</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim Number</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Filed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.claim_number}</TableCell>
                  <TableCell>{claim.amount}</TableCell>
                  <TableCell>{claim.status}</TableCell>
                  <TableCell>{claim.description || '-'}</TableCell>
                  <TableCell>{claim.filed_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  )
}

export default Dashboard
