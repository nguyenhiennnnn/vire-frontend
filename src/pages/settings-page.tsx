import { useAuth } from "../hooks/use-auth";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { AccountTab } from "../components/settings/tabs/account-tab";
import { SecurityTab } from "../components/settings/tabs/security-tab";
import { AppearanceTab } from "../components/settings/tabs/appearance-tab";
import { DangerTab } from "../components/settings/tabs/danger-tab";

const TABS = [
  { value: "account", label: "Tài khoản" },
  { value: "security", label: "Bảo mật" },
  { value: "appearance", label: "Giao diện" },
  { value: "danger", label: "Nguy hiểm" },
] as const;

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Cài đặt</h1>

      <Tabs defaultValue="account">
        <TabsList className="w-full rounded-none h-auto p-0 bg-transparent border-b mb-6">
          {TABS.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 rounded-none py-3 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="account">
          <AccountTab user={user} />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab isGoogleAccount={!!user?.googleId} />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>

        <TabsContent value="danger">
          <DangerTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
