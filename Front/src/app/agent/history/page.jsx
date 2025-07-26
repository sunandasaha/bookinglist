"use client";

import { useRouter } from "next/navigation";
import { Context } from "../../_components/ContextProvider";
import { getReq } from "../../_utils/request";
import { useContext, useEffect, useState } from "react";
import {User, CalendarDays, IndianRupee} from "lucide-react";

const AgentHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, hostHotel } = useContext(Context);
  const navigate = useRouter();

  const getData = async () => {
    try {
      const res = await getReq("guestbooking/agent", user?.token || "");
      if (res?.success) {
        setBookings(res.dbooks || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getData();
    } else {
      navigate.push("/");
    }
  }, [user]);

  if (loading) {
    return <div className="text-center py-8">Loading bookings...</div>;
  }
  return (
    <div className="w-full max-h-[80vh] overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-semibold text-center mb-4 text-blue-900">
        Your Booking History
      </h2>
      {bookings.length > 0 ? (
        bookings.map((booking, index) => (
                        <div
              key={index}
              className="border rounded-xl shadow-md p-4 bg-white space-y-3"
            >
              <h3 className="text-lg font-bold text-indigo-800">
                {booking.hotelId?.name || "Unknown Hotel"}
              </h3>

              <p className="flex items-center gap-2 text-indigo-900">
                <User size={16} className="text-green-900"/>
                <span className="font-semibold">Guest:</span>
                <span className="text-black">{booking.name}</span>
              </p>

              <p className="flex items-center gap-2 text-indigo-900">
                <CalendarDays size={16}  />
                <span className="font-semibold">From:</span>
                <span>{new Date(booking.fromDate).toLocaleDateString()}</span>
              </p>

              <p className="flex items-center gap-2 text-indigo-900">
                <CalendarDays size={16} className="text-green-900"/>
                <span className="font-semibold">To:</span>
                <span>
                  {new Date(
                    new Date(booking.toDate).setDate(
                      new Date(booking.toDate).getDate() + 1
                    )
                  ).toLocaleDateString()}
                </span>
              </p>

              <p className="flex items-center gap-2 text-indigo-900">
                <IndianRupee size={16} />
                <span className="font-semibold">Price:</span>
                <span>₹{booking.totalPrice}</span>
              </p>

              <p className="flex items-center gap-2 text-indigo-900">
                <IndianRupee size={16} className="text-green-900" />
                <span className="font-semibold">Commission:</span>
                <span>₹{booking.agentCut}</span>
              </p>
            </div>

        ))
      ) : (
        <p className="text-gray-500 text-center">No booking history found.</p>
      )}
    </div>
  );
};

export default AgentHistory;
