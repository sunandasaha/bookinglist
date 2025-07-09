"use client";

import React, { useState } from "react";
import { X, Copy } from "lucide-react";
import { useRouter } from "next/navigation";


export default function ProfileModal({ profile, onClose }) {
  if (!profile) return null;
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
    if (profile.url) {
      const site = "https://bookinglist-front.onrender.com/";

      const Url = site +`${profile.url}`;
      navigator.clipboard.writeText(Url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); 
    }
  }

  const navigate = useRouter();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[500px] max-w-full relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-red"
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
          <ProfileRow label="AccountName" value={profile.accountName} />
          <ProfileRow label="💰 UPI ID" value={profile.upi_id} />
          <ProfileRow label="🛏️ Rooms" value={profile.rooms} />
          <ProfileRow
            label="🌐 URL"
            value={
              profile.url ? (

                <div className=" flex items-center flex-wrap gap-2">
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-words"
                  >
                    {profile.url}
                  </a>
                  <button
                    onClick={handleCopy}
                    className="text-sm text-gray-600 border px-2 py-1 rounded hover:bg-gray-100"
                  >
                    <Copy size={14} className="inline-block mr-1" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              ) : (
                "N/A"
              )
            }
          />
          {profile.email && <ProfileRow label="📧 Email" value={profile.email} />}
        </div>

        <div className="inline p-5 justify-center flex gap-4">
          <button
            className="pbutton"
            onClick={() => {
              navigate.push("/hotel");
            }}
          >
            Edit
          </button>
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
