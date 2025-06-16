"use client";

import React, { useContext } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Context } from "../_components/ContextProvider";

export default function ProfileModal({ profile, onClose }) {
  if (!profile) return null;

  const navigate = useRouter();
  const { user } = useContext(Context); 

  const roomsCount = profile.rooms || 
    (profile.room_cat?.flatMap((cat) => cat.room_no).length || 
     profile.per_person_cat?.flatMap((cat) => cat.roomNumbers).length || 
     "N/A");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[500px] max-w-full relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          aria-label="Close Profile Modal"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          🏨 Hotel Profile
        </h2>
        <div className="space-y-3 text-sm text-black">
          <ProfileRow label="🏨 Property Name" value={profile.name} />
          <ProfileRow label="📍 Location" value={profile.location} />
          <ProfileRow label="📞 Phone" value={profile.ph1} />
          <ProfileRow label="📱 WhatsApp" value={profile.ph2} />
          <ProfileRow label="🛏️ Rooms" value={roomsCount} />
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 border-b pb-2">
      <span className="font-medium text-gray-700 whitespace-nowrap">{label}:</span>
      <span className="text-blue-600 font-semibold text-right break-words max-w-[60%]">
        {value || "N/A"}
      </span>
    </div>
  );
}
