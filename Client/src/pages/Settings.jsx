import WalletCard from '../components/WalletCard'
import NotificationToggle from '../components/NotificationToggle'
import ProfileForm from '../components/ProfileForm'

export default function Settings() {
  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-textSecondary text-lg">Manage your account and preferences</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-surface p-8 rounded-xl shadow-lg space-y-6">
          <h2 className="text-2xl font-semibold">Wallet</h2>
          <WalletCard />
        </div>

        <div className="bg-surface p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Profile</h2>
          <ProfileForm />
        </div>
      </div>

      <div className="bg-surface p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Notifications</h2>
        <div className="space-y-4">
          <NotificationToggle label="Payment confirmations" defaultChecked />
          <NotificationToggle label="Agent recommendations" defaultChecked />
          <NotificationToggle label="Approval requests" />
        </div>
      </div>
    </main>
  )
}
