import type { User } from "../../../types";
import { BasicInfoSection } from "../basic-info-section";
import { EmailSection } from "../email-section";
import { GoogleAccountSection } from "../google-account-section";

interface AccountTabProps {
  user: User;
}

export function AccountTab({ user }: AccountTabProps) {
  return (
    <div className="space-y-6">
      <BasicInfoSection user={user} />
      <EmailSection email={user?.email} isVerified={user?.isVerified} />
      {user?.googleId && <GoogleAccountSection />}
    </div>
  );
}
