import Sidebar from '../components/Sidebar'
import WalletCard from '../components/WalletCard'
import NotificationToggle from '../components/NotificationToggle'
import ProfileForm from '../components/ProfileForm'

export default function Settings() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface p-6 rounded-xl space-y-6">
            <h2 className="text-xl font-semibold">Wallet</h2>
            <WalletCard />
          </div>

          <div className="bg-surface p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <ProfileForm />
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl mt-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <NotificationToggle label="Payment confirmations" defaultChecked />
          <NotificationToggle label="Agent recommendations" defaultChecked />
          <NotificationToggle label="Approval requests" />
        </div>
      </main>
    </div>
  )
}