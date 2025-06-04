"use client";

import React, { useContext } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Context } from "../../_components/ContextProvider";

export default function ProfileModal({ profile, onClose }) {
  if (!profile) return null;
  // console.log("Profile passed to modal:", profile);
  const navigate = useRouter();
  const { setUser, setHosthotel } = useContext(Context);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          aria-label="Close Profile Modal"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center text-black">
          Hotel Profile
        </h2>

        <div className="space-y-3 text-sm text-black">
          <div>
            <strong>🏨 Property Name:</strong>{" "}
            {profile.name || profile.name || "N/A"}
          </div>
          <div>
            <strong>📍 Location:</strong> {profile.location || "N/A"}
          </div>
          <div>
            <strong>📞 Phone:</strong> {profile.ph1 || profile.ph1 || "N/A"}
            {profile.ph2 && `, ${profile.ph2}`}
          </div>
          <div>
            <strong>💰 UPI ID:</strong> {profile.upi_id || "N/A"}
          </div>
          <div>
            <strong>🛏️ Rooms:</strong>{" "}
            {profile.roooms || profile.rooms || "N/A"}
          </div>
          {profile.email && (
            <div>
              <strong>📧 Email:</strong> {profile.email}
            </div>
          )}
        </div>
        <div className="inline p-5 justify-center">
          <button
            className="pbutton"
            onClick={() => {
              navigate.push("/hotel");
            }}
          >
            Edit
          </button>
          <button
            className="pbutton"
            onClick={() => {
              setUser(null);
              setHosthotel(null);
              localStorage.removeItem("tok");
              navigate.push("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
