"use client";

import { useContext } from "react";
import { Context } from "../../../_components/ContextProvider";
import { site } from "../../../_utils/request";
import { useRouter } from "next/navigation";

export default function AgentProfile() {
  const { agent, setUser, setAgent } = useContext(Context);
  const navigate = useRouter();

  if (!agent) return null;

  const handleLogout = () => {
    localStorage.removeItem("tok");
    setUser(null);
    setAgent(null);
    navigate.push("/login");
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-6 space-y-4 text-black">
      <h2 className="text-2xl font-bold mb-4 text-center text-green-600 border-b pb-2">
          Agent Profile
      </h2>

      <div className="space-y-3 text-sm text-black">
        <ProfileRow label="👤 Name" value={agent.name} />
        <ProfileRow label="🏢 Agency" value={agent.agency} />
        <ProfileRow label="📍 Location" value={agent.location} />
        <ProfileRow label="💬 Whatsapp No." value={agent.ph1} />
        {agent.ph2 && <ProfileRow label="📞 Secondary No." value={agent.ph2} />}
        {agent.upi_id && <ProfileRow label="💰 UPI ID" value={agent.upi_id} />}
        {agent.visiting_card && (
          <div className="flex justify-between items-start gap-4 border-b pb-2">
            <span className="font-medium text-gray-700 whitespace-nowrap">🖼️ Visiting Card:</span>
            <img
              src={site + "imgs/" + agent.visiting_card}
              alt="Visiting Card"
              className="w-40 h-auto rounded border"
            />
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 ">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate.push("/agent")}
        >
          Edit
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 border-b pb-2">
      <span className="font-medium text-gray-700 whitespace-nowrap">{label}:</span>
      <span className="text-blue-600 font-semibold text-right break-words max-w-[60%]">
        {value || "N/A"}
      </span>
    </div>
  );
}
