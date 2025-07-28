"use client";

import { useContext } from "react";
import { Context } from "../../../_components/ContextProvider";
import { imgurl } from "../../../_utils/request";
import { useRouter } from "next/navigation";
import {
  UserCircle,
  Building2,
  MapPin,
  Phone,
  IndianRupee,
  Image,
  MessageCircle,
} from "lucide-react";

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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-6 space-y-4 text-black">
      <h2 className="text-2xl font-bold text-center text-blue-900 border-b pb-2">
        👤 Agent Profile
      </h2>

      <div className="space-y-3 text-sm">
        <ProfileRow
          icon={<UserCircle size={18} />}
          label="Name"
          value={agent.name}
        />
        <ProfileRow
          icon={<Building2 size={18} />}
          label="Agency"
          value={agent.agency}
        />
        <ProfileRow
          icon={<MapPin size={18} />}
          label="Location"
          value={agent.location}
        />
        <ProfileRow
          icon={<MessageCircle size={18} />}
          label="Whatsapp No."
          value={agent.ph1}
        />
        {agent.ph2 && (
          <ProfileRow
            icon={<Phone size={18} />}
            label="Secondary No."
            value={agent.ph2}
          />
        )}
        {agent.upi_id && (
          <ProfileRow
            icon={<IndianRupee size={18} />}
            label="UPI ID"
            value={agent.upi_id}
          />
        )}

        {agent.visiting_card && (
          <div className="flex items-start gap-3 border-b pb-2">
            <div className="flex items-center gap-1 text-gray-700 font-medium">
              <span className="text-blue-900">
                <Image size={18} />
              </span>
              <span className="text-blue-900 font-medium">Visiting Card:</span>
            </div>
            <img
              src={imgurl + agent.visiting_card}
              alt="Visiting Card"
              className="w-40 h-auto rounded border"
            />
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button
          className="bg-blue-900 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition duration-300"
          onClick={() => navigate.push("/agent")}
        >
          Edit
        </button>
        <button
          className="px-4 py-2 bg-white text-blue-600 border border-blue-900 rounded-full hover:bg-blue-200 transition"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b pb-2">
      <div className="flex items-center gap-1 text-gray-700 font-medium min-w-[130px]">
        <span className="text-blue-900">{icon}</span>
        <span className="text-blue-900 font-medium">{label}:</span>
      </div>
      <div className="text-slate-800 font-semibold text-right break-words max-w-[60%]">
        {value || "N/A"}
      </div>
    </div>
  );
}
