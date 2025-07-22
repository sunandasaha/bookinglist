"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import { Context } from "../../_components/ContextProvider";
import { postReq } from "../../_utils/request";

const SelectRole = () => {
  const { user, setUser } = useContext(Context);
  const navigate = useRouter();

  const set_role = async (role: string) => {
     if (!user) return;
    if (user.role === "") {
      const res = await postReq("user/setrole", { role }, user.token);
      if (res.status === "success") {
        setUser((p) => ({ ...p, role: res.user.role }));
        if (res.user.role === "host") navigate.push("/hotel");
        else if (res.user.role === "agent") navigate.push("/agent");
      }
    }
  };
    return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">Select Your Role</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Host Card */}
          <div
            onClick={() => set_role("host")}
            className="cursor-pointer bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:border-blue-500 hover:shadow-md transition duration-200"
          >
            <h2 className="text-xl font-semibold text-blue-700 mb-2">🏨 Host</h2>
            <p className="text-black-700 text-sm">
              For property owners, hotel, or homestay who want to manage bookings, rooms,
              and guest details through our platform.
            </p>
          </div>

          {/* Agent Card */}
          <div
            onClick={() => set_role("agent")}
            className="cursor-pointer bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:border-blue-500 hover:shadow-md transition duration-200"
          >
            <h2 className="text-xl font-semibold text-blue-700 mb-2">🧑‍💼 Agent</h2>
            <p className="text-black-700 text-sm">
              For travel agents who book properties for clients and earn commissions on
              each successful booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;

