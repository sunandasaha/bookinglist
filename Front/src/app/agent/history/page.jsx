"use client";

import { useRouter } from "next/navigation";
import { Context } from "../../_components/ContextProvider";
import { getReq } from "../../_utils/request";
import { useContext, useEffect, useState } from "react";

const AgentHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, hostHotel } = useContext(Context);
  const navigate = useRouter();

  const getData = async () => {
    try {
      const res = await getReq("guestbooking/agent", user?.token || "");
      console.log(res);

      if (res?.success) {
        setBookings(res.bookings || []);
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
      <h2 className="text-xl font-semibold text-center mb-4 text-green-800">Your Booking History</h2>
      {bookings.length > 0 ? (
        bookings.map((booking, index) => (
          <div
            key={index}
            className="border rounded-lg shadow-sm p-4 bg-white space-y-1"
          >
            <h3 className="text-lg font-bold text-blue-900">{booking.hotelId?.name || "Unknown Hotel"}</h3>
            <p> <strong> 👤Guest: </strong>{booking.name}</p>
            <p> <strong>📅 From: </strong> {new Date(booking.fromDate).toLocaleDateString()} →<strong>To:</strong> {new Date(booking.toDate).toLocaleDateString()}</p>
            <p> <strong>💰 Price:</strong> ₹{booking.totalPrice}</p>
            <p> <strong>💰commission:</strong>  ₹{booking.agentCut}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No booking history found.</p>
      )}
    </div>
  );
};

export default AgentHistory;