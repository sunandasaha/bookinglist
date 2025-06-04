"use client";
import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { format, addDays, isWithinInterval } from "date-fns";
import clsx from "clsx";
import GuestBookingForm from "./GuestBookingForm";
import { Context } from "../../_components/ContextProvider";

export default function CalendarGrid({ startDate }) {
  const [dates, setDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { hosthotel } = useContext(Context);
  const containerRef = useRef(null);
  const rooms = useMemo(() => {
    if (!hosthotel?.rooms) return [];
    return Array.from({ length: hosthotel.rooms }, (_, i) => ({
      id: i + 1,
      name: `Room ${i + 1}`,
    }));
  }, [hosthotel]);
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

  // Calculate all cells between startCell and endCell for drag selection
  const getSelectedCells = () => {
    if (!startCell || !endCell) return [];

    const [startRoomIdx, startDateIdx] = startCell;
    const [endRoomIdx, endDateIdx] = endCell;

    const minRoomIdx = Math.min(startRoomIdx, endRoomIdx);
    const maxRoomIdx = Math.max(startRoomIdx, endRoomIdx);
    const minDateIdx = Math.min(startDateIdx, endDateIdx);
    const maxDateIdx = Math.max(startDateIdx, endDateIdx);

    const selected = [];
    for (let r = minRoomIdx; r <= maxRoomIdx; r++) {
      for (let d = minDateIdx; d <= maxDateIdx; d++) {
        selected.push([r, d]);
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
    if (selectedCells.length === 0) return;

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
  const bookBtnPosition = useMemo(() => {
    if (selectedCells.length === 0 || !containerRef.current) return null;

    const rows = selectedCells.map(([r]) => r);
    const cols = selectedCells.map(([_, c]) => c);

    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);

    const gridRows = containerRef.current.querySelectorAll(".grid-row");
    if (!gridRows[minRow]) return null;

    const firstCell = gridRows[minRow].querySelectorAll(".grid-cell")[minCol];
    const lastCell = gridRows[maxRow].querySelectorAll(".grid-cell")[maxCol];

    if (!firstCell || !lastCell) return null;

    const containerRect = containerRef.current.getBoundingClientRect();
    const firstRect = firstCell.getBoundingClientRect();
    const lastRect = lastCell.getBoundingClientRect();

    const top = firstRect.top - containerRect.top;
    const left = firstRect.left - containerRect.left;
    const width = lastRect.right - firstRect.left;
    const height = lastRect.bottom - firstRect.top;

    return { top, left, width, height };
  }, [selectedCells]);
  const handleBookingSave = (formData) => {
    const bookingId = `B-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const newBookings = selectedBooking.roomIds.map((roomId) => ({
      roomId,
      from: selectedBooking.from,
      to: selectedBooking.to,
      ...formData,
      status: "Booked",
      bookingId,
    }));

    setBookings((prev) => [...prev, ...newBookings]);
    setSelectedBooking(null);
    setStartCell(null);
    setEndCell(null);
  };

  return (
    <div
      className="w-full overflow-x-auto p-4 bg-white relative"
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="min-w-[300px] md:min-w-[900px] border rounded-xl shadow-xl select-none">
        {/* Header row */}
        <div className="grid grid-cols-[150px_repeat(7,1fr)] bg-blue-600 text-white font-semibold text-sm">
          <div className="p-3 border-r">Room / Date</div>
          {dates.map((date, i) => (
            <div key={i} className="p-3 text-center border-r">
              <div>{format(date, "EEE")}</div>
              <div>{format(date, "dd MMM")}</div>
            </div>
          ))}
        </div>

        {/* Room rows */}
        {rooms.map((room, rIdx) => (
          <div
            key={room.id}
            className="grid grid-cols-[150px_repeat(7,1fr)] text-sm border-t grid-row"
          >
            <div className="p-3 font-medium bg-white text-gray-800 border-r">
              {room.name}
            </div>

            {dates.map((date, dIdx) => {
              const booking = getBookingForCell(room.id, date);
              const selected = isSelected(rIdx, dIdx);

              return (
                <div
                  key={dIdx}
                  className={clsx(
                    "border-r border-b p-2 flex items-center justify-center cursor-pointer select-none grid-cell",
                    selected && "bg-blue-300",
                    booking && "bg-green-400 text-white",
                    !booking && !selected && "hover:bg-blue-100"
                  )}
                  onMouseDown={() => handleMouseDown(rIdx, dIdx)}
                  onMouseEnter={() => handleMouseEnter(rIdx, dIdx)}
                >
                  {!booking && selected ? "Selected" : null}
                </div>
              );
            })}
          </div>
        ))}

        {/* Floating Book button */}
        {selectedCells.length > 0 && bookBtnPosition && !selectedBooking && (
          <button
            style={{
              position: "absolute",
              top: bookBtnPosition.top + bookBtnPosition.height + 5,
              left: bookBtnPosition.left,
              zIndex: 1000,
              backgroundColor: "#2563eb",
              color: "white",
              padding: "6px 12px",
              borderRadius: "6px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={handleBookClick}
          >
            Book
          </button>
        )}
      </div>

      {/* Booking form modal */}
      {selectedBooking && (
        <GuestBookingForm
          booking={selectedBooking}
          onSave={handleBookingSave}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
