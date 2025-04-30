import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

function Dashboard() {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Insurance Dashboard</h1>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  )
}

export default Dashboard
