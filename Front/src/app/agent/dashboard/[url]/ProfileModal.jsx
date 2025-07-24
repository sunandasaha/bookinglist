"use client";

import React, { useState } from "react";
import {X,Copy,Building2,MapPin,Phone,MessageSquare,UserCircle,IndianRupee,BedDouble,Globe,Mail,} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileModal({ profile, onClose }) {
  if (!profile) return null;
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (profile.url) {
      const site = "https://www.bookinglist.in/";
      const Url = site + profile.url;
      navigator.clipboard.writeText(Url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const navigate = useRouter();

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

        <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">
          🏨 Hotel Profile
        </h2>

        <div className="space-y-3 text-sm text-black">
          <ProfileRow icon={<Building2 size={16} />} label="Property Name" value={profile.name} />
          <ProfileRow icon={<MapPin size={16} />} label="Location" value={profile.location} />
          <ProfileRow icon={<Phone size={16} />} label="Phone" value={profile.ph1} />
          <ProfileRow icon={<MessageSquare size={16} />} label="WhatsApp" value={profile.ph2} />
          <ProfileRow icon={<UserCircle size={16} />} label="Account Name" value={profile.accountName} />
          <ProfileRow icon={<BedDouble size={16} />} label="Rooms" value={profile.rooms} />
        </div>

        <div className="inline p-5 justify-center flex gap-4">
          <button
            className="bg-blue-900 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition duration-300"
            onClick={() => navigate.push("/hotel")}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
function ProfileRow({ icon, label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 border-b pb-2">
      <span className="flex items-center gap-2 whitespace-nowrap">
        <span className="text-blue-900">{icon}</span> 
        <span className="text-black-900 font-medium">{label}:</span> 
      </span>
      <span className="text-slate-800 font-semibold text-right break-words max-w-[60%]">
        {value || "N/A"}
      </span>
    </div>
  );
}

