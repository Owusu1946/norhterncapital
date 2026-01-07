"use client";

import { CheckCircle, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useStaffAuth } from "@/contexts/StaffAuthContext";

export function ProfileForm() {
    const { user } = useStaffAuth();
    const [gender, setGender] = useState("male");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    // Populate form with user data when available
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full flex-1 flex flex-col overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-8">Personal Information</h2>

            {/* Gender Selection */}
            <div className="flex gap-8 mb-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gender === 'male' ? 'border-orange-500' : 'border-gray-300'}`}>
                        {gender === 'male' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                    <input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={() => setGender('male')} className="hidden" />
                    <span className="font-bold text-gray-700">Male</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gender === 'female' ? 'border-orange-500' : 'border-gray-300'}`}>
                        {gender === 'female' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                    <input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={() => setGender('female')} className="hidden" />
                    <span className="font-bold text-gray-700">Female</span>
                </label>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">First Name</label>
                    <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-orange-500 focus:outline-none transition-colors font-medium text-gray-800"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">Last Name</label>
                    <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-orange-500 focus:outline-none transition-colors font-medium text-gray-800"
                    />
                </div>

                <div className="space-y-2 col-span-2">
                    <label className="text-sm font-bold text-gray-500">Email</label>
                    <div className="relative">
                        <input
                            name="email"
                            value={formData.email}
                            readOnly
                            className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:outline-none font-medium text-gray-800 pr-24 cursor-not-allowed"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">
                            <CheckCircle size={12} />
                            Verified
                        </span>
                    </div>
                </div>


                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">Phone Number</label>
                    <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-orange-500 focus:outline-none transition-colors font-medium text-gray-800"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">Location</label>
                    <div className="relative">
                        <input
                            value="Ghana"
                            readOnly
                            className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:outline-none font-bold text-gray-800 cursor-not-allowed"
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                </div>

            </div>

            {/* Actions */}
            <div className="mt-auto flex gap-4 pt-6 border-t border-gray-100">
                <button className="flex-1 py-4 border-2 border-orange-200 text-orange-500 font-bold rounded-2xl hover:bg-orange-50 transition-colors">
                    Discard Changes
                </button>
                <button className="flex-1 py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 shadow-lg shadow-orange-200 transition-colors">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
