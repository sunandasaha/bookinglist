"use client";
import { useState } from "react";
import { format } from "date-fns";

export default function RescheduleModal({ booking, onClose }) {
  const [showForm, setShowForm] = useState(false);

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
          <div><strong>Name:</strong> {booking.name}</div>
          <div><strong>Phone:</strong> {booking.phone}</div>
          <div><strong>Room(s):</strong> {booking.rooms?.join(", ")}</div>
          <div>
            <strong>Current Stay:</strong>{" "}
            {format(new Date(booking.fromDate), "dd MMM yyyy")} -{" "}
            {format(new Date(booking.toDate), "dd MMM yyyy")}
          </div>
          <div>
            <strong>Number of rooms:</strong>{booking.rooms?.length}
          </div>
        </div>
        {!showForm ? (
          <div className="flex justify-center gap-4">
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              onClick={() => {
                console.log("Hold action"); // hold
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
                defaultValue={booking.fromDate.slice(0, 10)}
                className="border px-3 py-1 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">To Date:</label>
              <input
                type="date"
                defaultValue={booking.toDate.slice(0, 10)}
                className="border px-3 py-1 rounded w-full"
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
                  console.log("Submit updated dates"); //submit
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
