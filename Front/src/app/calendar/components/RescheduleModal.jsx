"use client";
import { useContext, useState } from "react";
import { format, addDays } from "date-fns";
import { Context } from "../../_components/ContextProvider";
import { putReq } from "../../_utils/request";

export default function RescheduleModal({ booking, onClose }) {
  const [showForm, setShowForm] = useState(false);
  const { setPending, hosthotel, user } = useContext(Context);
  const [dates, setDates] = useState({
    from: booking.fromDate.slice(0, 10),
    to: booking.toDate.slice(0, 10),
  });

  const reschedule = async () => {
    let cat;
    if (hosthotel.pay_per.room) {
      cat = hosthotel.room_cat.find((e) =>
        e.room_no.includes(booking.rooms[0])
      );
    } else {
      cat = hosthotel.per_person_cat.find((e) =>
        e.roomNumbers.includes(booking.rooms[0])
      );
    }
    const res = await putReq(
      "guestbooking/reschedule",
      {
        catrooms: hosthotel.pay_per.room ? cat.room_no : cat.roomNumbers,
        fromDate: new Date(dates.from),
        toDate: new Date(dates.to),
        bid: booking._id,
        nrooms: booking.rooms.length,
      },
      user.token
    );

    if (res.success) {
      setPending((p) => [...p]);
      onClose();
    } else {
      console.log(res);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg relative">
        <button
          className="absolute top-2 right-3 text-red-500 text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4 text-blue-600">
          Reschedule Booking
        </h2>
        <div className="space-y-2 text-sm mb-4">
          <div>
            <strong>Name:</strong> {booking.name}
          </div>
          <div>
            <strong>Phone:</strong> {booking.phone}
          </div>
          <div>
            <strong>Room(s):</strong> {booking.rooms?.join(", ")}
          </div>
          <div>
            <strong>Number of rooms:</strong>
            {booking.rooms?.length}
          </div>
          <div>
            <strong>Checkin:</strong>{" "}
            {format(new Date(booking.fromDate), "dd MMM yyyy")}
          </div>
          <div>
             <strong>Checkout:</strong>{" "}

            {format(addDays(new Date(booking.toDate), 1) , "dd MMM yyyy")}
          </div>
        </div>
        {!showForm ? (
          <div className="flex justify-center gap-4">
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              onClick={async () => {
                console.log("Hold action"); // hold
                const res = await putReq(
                  "guestbooking/status",
                  {
                    id: booking._id,
                    can: false,
                  },
                  user.token
                );
                if (res.success) {
                  setPending((p) => [...p]);
                  onClose();
                }
              }}
            >
              Hold
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              onClick={() => setShowForm(true)}
            >
              Reschedule Now
            </button>
          </div>
        ) : (
          <form className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium">From Date:</label>
              <input
                type="date"
                value={dates.from}
                className="border px-3 py-1 rounded w-full"
                onChange={(e) => {
                  setDates((p) => ({ ...p, from: e.target.value }));
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">To Date:</label>
              <input
                type="date"
                value={dates.to}
                className="border px-3 py-1 rounded w-full"
                onChange={(e) => {
                  setDates((p) => ({ ...p, to: e.target.value }));
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowForm(false)}
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={(e) => {
                  e.preventDefault();
                  reschedule(); //submit
                }}
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
