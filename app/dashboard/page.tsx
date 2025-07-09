import { getOrCreateProfile } from '@/lib/user'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const profile = await getOrCreateProfile()
  
  if (!profile) {
    redirect('/sign-in')
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      <div className="card-custom p-4 mb-4">
        <h2 className="text-xl mb-2">Welcome, {profile.firstName} {profile.lastName}</h2>
        <p className="text-gray-600">Phone: {profile.phoneNumber}</p>
        <p className="text-gray-600">Profile ID: {profile.id}</p>
      </div>

      <div className="card-custom p-4">
        <h3 className="text-lg font-semibold mb-2">Your Farms</h3>
        {profile.ownedFarms.length > 0 ? (
          profile.ownedFarms.map((farm) => (
            <div key={farm.id} className="border rounded-lg p-3 mb-2">
              <h4 className="font-medium">{farm.farmName}</h4>
              <p className="text-sm text-gray-600">Province: {farm.province}</p>
              <p className="text-sm text-gray-600">Code: {farm.farmCode}</p>
              <p className="text-sm text-gray-600">Animals: {farm.animals.length}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No farms found</p>
        )}
      </div>
    </div>
  )
}