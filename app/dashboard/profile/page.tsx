
"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/dashboard/profile/ProfileForm";
import { ProfileSidebar } from "@/components/dashboard/profile/ProfileSidebar";
import { SecurityForm } from "@/components/dashboard/profile/SecurityForm";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<"personal" | "security">("personal");

    return (
        <div className="p-8 pb-20 h-full flex gap-8 overflow-hidden items-start">
            <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === "personal" ? <ProfileForm /> : <SecurityForm />}
        </div>
    );
}
