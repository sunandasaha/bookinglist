"use client";

import { useState, useEffect } from "react";
import { format, addDays, isWithinInterval } from "date-fns";
import clsx from "clsx";
import { BedDouble, User, X } from "lucide-react";

const rooms = [
  { id: 1, name: "Room 1", type: "2-share" },
  { id: 2, name: "Room 2", type: "3-share" },
  { id: 3, name: "Room 3", type: "5-share" },
  { id: 4, name: "Room 4", type: "2-share" },
  { id: 5, name: "Room 5", type: "4-share" },
];

export default function CalendarGrid({ startDate }) {
  const [dates, setDates] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!startDate) return;
    const next7Days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    setDates(next7Days);
  }, [startDate]);

  const getBookingForCell = (roomId, date) => {
    return bookings.find(
      (b) =>
        b.roomId === roomId &&
        isWithinInterval(date, {
          start: new Date(b.from),
          end: new Date(b.to),
        })
    );
  };

  const getSelectedCells = () => {
    if (!startCell || !endCell) return [];

    const [startRoomIdx, startDateIdx] = startCell;
    const [endRoomIdx, endDateIdx] = endCell;

    const minRoomIdx = Math.min(startRoomIdx, endRoomIdx);
    const maxRoomIdx = Math.max(startRoomIdx, endRoomIdx);
    const minDateIdx = Math.min(startDateIdx, endDateIdx);
    const maxDateIdx = Math.max(startDateIdx, endDateIdx);

    const selected = [];
    for (let roomIdx = minRoomIdx; roomIdx <= maxRoomIdx; roomIdx++) {
      for (let dateIdx = minDateIdx; dateIdx <= maxDateIdx; dateIdx++) {
        selected.push([roomIdx, dateIdx]);
      }
    }
    return selected;
  };

  const selectedCells = getSelectedCells();
  const isSelected = (roomIdx, dateIdx) =>
    selectedCells.some(([r, c]) => r === roomIdx && c === dateIdx);

  const handleMouseDown = (rIdx, dIdx) => {
    setStartCell([rIdx, dIdx]);
    setEndCell([rIdx, dIdx]);
    setIsDragging(true);
  };

  const handleMouseEnter = (rIdx, dIdx) => {
    if (isDragging) setEndCell([rIdx, dIdx]);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleBookClick = () => {
    const uniqueRoomIndices = [...new Set(selectedCells.map(([r]) => r))];
    const dateIndices = selectedCells.map(([_, c]) => c);
    const from = dates[Math.min(...dateIndices)];
    const to = dates[Math.max(...dateIndices)];

    setSelectedBooking({
      from,
      to,
      roomIds: uniqueRoomIndices.map((i) => rooms[i].id),
      roomNames: uniqueRoomIndices.map((i) => rooms[i].name),
    });
  };

  const handleBookingSave = (e) => {
    e.preventDefault();
    const form = e.target;
    const bookingId = `B-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newBookings = selectedBooking.roomIds.map((roomId) => ({
      roomId,
      from: selectedBooking.from,
      to: selectedBooking.to,
      name: form.name.value,
      address: form.address.value,
      phone: form.phone.value,
      whatsapp: form.whatsapp.value,
      email: form.email.value,
      adults: form.adults.value,
      children: form.children.value,
      message: form.message.value,
      status: "Booked",
      bookingId,
    }));

    setBookings([...bookings, ...newBookings]);
    setSelectedBooking(null);
    setStartCell(null);
    setEndCell(null);
  };

  return (
    <div className="w-full overflow-x-auto p-4 bg-white" onMouseUp={handleMouseUp}>
      {/* Calendar Grid */}
      <div className="min-w-[300px] md:min-w-[900px] border rounded-xl shadow-xl">
        {/* Header */}
        <div className="grid grid-cols-[150px_repeat(7,1fr)] bg-blue-600 text-white font-semibold text-sm">
          <div className="p-3 border-r">Room / Date</div>
          {dates.map((date, i) => (
            <div key={i} className="p-3 text-center border-r">
              <div>{format(date, "EEE")}</div>
              <div>{format(date, "dd MMM")}</div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {rooms.map((room, rIdx) => (
          <div key={room.id} className="grid grid-cols-[150px_repeat(7,1fr)] text-sm">
            <div className="p-3 font-medium bg-white text-gray-800 border-r">
              {room.name} <span className="text-xs text-gray-500">({room.type})</span>
            </div>

            {dates.map((date, dIdx) => {
              const booking = getBookingForCell(room.id, date);
              const selected = isSelected(rIdx, dIdx);

              return (
                <div
                  key={`${room.id}-${dIdx}`}
                  onMouseDown={() => handleMouseDown(rIdx, dIdx)}
                  onMouseEnter={() => handleMouseEnter(rIdx, dIdx)}
                  className={clsx(
                    "p-2 border-r flex flex-col items-center justify-center gap-1 cursor-pointer min-h-[80px]",
                    selected && "bg-blue-200",
                    booking
                      ? "bg-red-300 text-gray-900 font-semibold"
                      : "bg-white text-gray-700"
                  )}
                >
                  <BedDouble size={16} />
                  {booking ? (
                    <div className="text-xs text-center">
                      <div className="font-bold">{booking.name}</div>
                      <div className="text-[10px]">ID: {booking.bookingId}</div>
                    </div>
                  ) : (
                    <div className="text-xs">
                      <User size={12} className="inline" /> {room.type.split("-")[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Book Button */}
      {selectedCells.length > 0 && !selectedBooking && (
        <button
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white py-2 px-6 rounded-lg shadow-lg z-10"
          onClick={handleBookClick}
        >
          Book Selected ({selectedCells.length} cells)
        </button>
      )}

      {/* Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-black">Guest Booking</h3>
              <button onClick={() => setSelectedBooking(null)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleBookingSave} className="space-y-4">
              <div className="bg-gray-100 p-3 rounded text-black">
                <p><strong>Dates:</strong> {format(selectedBooking.from, "MMM dd")} - {format(selectedBooking.to, "MMM dd")}</p>
                <p><strong>Rooms:</strong> {selectedBooking.roomNames.join(", ")}</p>
                <p><strong>Booking ID:</strong> Will be generated on confirmation</p>
              </div>

              <input name="name" placeholder="Guest Name" required className="w-full p-2 border rounded text-black" />
              <input name="address" placeholder="Address" className="w-full p-2 border rounded text-black" />
               <div className="grid grid-cols-2 gap-4">
              <input name="phone" placeholder="Phone Number" required className="w-full p-2 border rounded text-black" />
              <input name="whatsapp" placeholder="WhatsApp Number" className="w-full p-2 border rounded text-black" />
              </div>
              <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded text-black" />

              <div className="grid grid-cols-2 gap-4">
                <input name="adults" type="number" placeholder="Adults" min="1" required className="w-full p-2 border rounded text-black" />
                <input name="children" type="number" placeholder="Children" min="0" className="w-full p-2 border rounded text-black" />
              </div>

              <textarea
                name="message"
                defaultValue={`Hi, your booking is confirmed at our hotel. Your Booking ID will be generated after confirmation.`}
                className="w-full p-2 border rounded text-black"
                rows={3}
              />

              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
