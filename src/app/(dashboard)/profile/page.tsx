import { getProfileData } from "@/services/profile.service";
import { ProfileClientView } from "@/components/profile/ProfileClientView";

export const metadata = {
    title: "Profile - VoltTrack",
    description: "Manage your profile and preferences",
};

export default async function ProfilePage() {
    // Fetch data on the server
    const profile = await getProfileData();

    return (
        <ProfileClientView initialProfile={profile as any} />
    );
}
