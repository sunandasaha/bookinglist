"use client";
import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { format, addDays, isWithinInterval } from "date-fns";
import clsx from "clsx";
import GuestBookingForm from "./GuestBookingForm";
import { Context } from "../../_components/ContextProvider";
import RoomInfoPopup from "./RoomInfoPopup";
export default function CalendarGrid({ startDate }) {
  const [dates, setDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRoomName, setSelectedRoomName] = useState(null);
  const [viewBooking, setViewBooking] = useState(null);

  const { hosthotel } = useContext(Context);
  const containerRef = useRef(null);
  const rooms = useMemo(() => {
    if (!hosthotel) return [];

    const expectedCount = hosthotel.rooms || 0;

    // === Per Person Pricing ===
    if (hosthotel.pay_per?.person && hosthotel.per_person_cat) {
      const filledRooms = hosthotel.per_person_cat.flatMap((cat, catIdx) =>
        cat.roomNumbers.map((name, i) => ({
          id: `${catIdx}-${i}`,
          name,
          price: {
            one: cat.rate1,
            two: cat.rate2,
            three: cat.rate3,
            four: cat.rate4,
          }
        }))
      );

      const missingCount = expectedCount - filledRooms.length;
      const emptyRooms = Array.from({ length: missingCount }, (_, i) => ({
        id: `empty-${i + 1}`,
        name: '',
        empty: true,
      }));

      return [...filledRooms, ...emptyRooms];
    }

    // === Per Room Pricing ===
    else if (hosthotel.pay_per?.room && hosthotel.room_cat) {
      const filledRooms = hosthotel.room_cat.flatMap((cat, catIdx) =>
        cat.room_no.map((name, i) => ({
          id: `${catIdx}-${i}`,
          name,
          price: { rate: cat.price },
        }))
      );

      const missingCount = expectedCount - filledRooms.length;
      const emptyRooms = Array.from({ length: missingCount }, (_, i) => ({
        id: `empty-${i + 1}`,
        name: '',
        empty: true,
      }));

      return [...filledRooms, ...emptyRooms];
    }

    return [];
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
    if (isSelected(rIdx, dIdx)) {
      setStartCell(null);
      setEndCell(null);
      setIsDragging(false);
      return;
    }
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
    const scrollTop = containerRef.current.scrollTop;
    const scrollLeft = containerRef.current.scrollLeft;
    const top = firstRect.top - containerRect.top + scrollTop;
    const left = firstRect.left - containerRect.left + scrollLeft;
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

  // Touch handlers (same as your code)
  useEffect(() => {
    if (!startDate) return;
    const next7Days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    setDates(next7Days);
    const grid = containerRef.current;
    if (!grid) return;

    const getCellData = (el) => {
      const cell = el?.closest(".grid-cell");
      if (!cell) return null;
      const rIdx = parseInt(cell.dataset.room);
      const dIdx = parseInt(cell.dataset.date);
      if (isNaN(rIdx) || isNaN(dIdx)) return null;
      return [rIdx, dIdx];
    };

    const handleTouchStart = (e) => {
      const data = getCellData(e.target);
      if (!data) return;
      setStartCell(data);
      setEndCell(data);
      setIsDragging(true);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const data = getCellData(el);
      if (data && isDragging) setEndCell(data);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    grid.addEventListener("touchstart", handleTouchStart, { passive: true });
    grid.addEventListener("touchmove", handleTouchMove);
    grid.addEventListener("touchend", handleTouchEnd);

    return () => {
      grid.removeEventListener("touchstart", handleTouchStart);
      grid.removeEventListener("touchmove", handleTouchMove);
      grid.removeEventListener("touchend", handleTouchEnd);
    };
  }, [startDate, containerRef, isDragging]);
  return (
    <div
      className="relative overflow-x-auto w-full bg-white"
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >

      <div className="inline-block min-w-[900px] border rounded-xl shadow-xl select-none">
        {/* Header row */}
        <div className="grid grid-cols-[120px_repeat(7,1fr)] bg-blue-600 text-white font-semibold md:text-sm">
          <div className="p-2 md:p-3 border-r bg-blue-600 sticky left-0 z-10">Room / Date</div>
          {dates.map((date, i) => (
            <div key={i} className="p-2 md:p-3 text-center border-r">
              <div>{format(date, "EEE")}</div>
              <div>{format(date, "dd MMM")}</div>
            </div>
          ))}
        </div>

        {/* Availability row */}
        <div className="grid grid-cols-[120px_repeat(7,1fr)] bg-green-200 text-sm font-medium text-gray-800 border-b grid-row">
          <div className="p-2 md:p-3 border-r whitespace-nowrap bg-green-200 sticky left-0 z-10">Available Rooms</div>
          {dates.map((date, dIdx) => {
            const bookedRoomsCount = rooms.filter((room) =>
              getBookingForCell(room.id, date)
            ).length;
            const available = rooms.length - bookedRoomsCount;
            return (
              <div
                key={dIdx}
                className="p-2 md:p-3 text-center border-r grid-cell"
                data-room={-1}
                data-date={dIdx}
              >
                {available} available
              </div>
            );
          })}
        </div>

        {/* Room rows */}
        {rooms.map((room, rIdx) => {
          return (
            <div
              key={room.id}
              className="grid grid-cols-[120px_repeat(7,1fr)] text-sm border-t grid-row"
            >
              <div
                className={clsx(
                  "p-2 md:p-3 font-medium border-r cursor-pointer bg-white sticky left-0 z-10",
                  room.empty
                    ? "bg-white-100 text-gray-400 cursor-default"
                    : "bg-white text-gray-800 hover:text-blue-700"
                )}
                 onClick={() => !room.empty && setSelectedRoomName(room.name)}
              >
                <div>{room.name || `Room ${room.id}`}</div>
                {!room.empty && (
                  <div className="text-sm font-normal text-gray-500">
                    {room.price?.one
                      ? `₹${room.price.one} / 1 person`
                      : room.price?.rate
                      ? `₹${room.price.rate}`
                      : ""}
                  </div>
                )}
                {room.empty && (
                  <div className="text-xs italic text-gray-400 mt-1">
                    Not added
                  </div>
                )}
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
                    onClick={() => {
                                   if (booking) setViewBooking(booking); // <-- add this
                     }}
                    data-room={rIdx}
                    data-date={dIdx}
                  >
                   {booking ? (
                      <div className="text-[10px] text-white text-center leading-tight">
                        {booking.name}
                        <br />
                        <span className="text-[8px]">ID: {booking.bookingId}</span>
                      </div>
                    ) : selected ? (
                      "Selected"
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Floating Book button */}
        {selectedCells.length > 0 &&
        bookBtnPosition &&
        !selectedBooking &&
        selectedCells.every(([r, d]) => !getBookingForCell(rooms[r]?.id, dates[d])) && (
        <button
            style={{
              position: "absolute",
              top: bookBtnPosition.top + bookBtnPosition.height - 30,
              left: bookBtnPosition.left + bookBtnPosition.width - 80,
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
      {selectedRoomName && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="relative">
      <button
        onClick={() => setSelectedRoomName(null)}
        className="absolute top-1 right-1 text-red-500 font-bold text-xl"
      >
        ×
      </button>
      <RoomInfoPopup roomName={selectedRoomName} />
    </div>
  </div>
)}
{viewBooking && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded-lg shadow-xl max-w-xs w-full relative">
      <h2 className="text-xl font-bold text-center mb-3 text-green-700">
        Booking Details
      </h2>
      <div className="text-sm text-gray-800">
        <p><strong>Name:</strong> {viewBooking.name}</p> 
        <p><strong>Phone:</strong> {viewBooking.phone}</p>
        <p><strong>WhatsApp:</strong> {viewBooking.whatsapp}</p>
        <p><strong>Booking ID:</strong> {viewBooking.bookingId}</p>
        <p><strong>Status:</strong> {viewBooking.status}</p>
        <p><strong>Room: </strong> {rooms.find((r) => r.id === viewBooking.roomId)?.name || "Unknown"}</p>
        <p><strong>From:</strong> {format(new Date(viewBooking.from), "dd MMM yyyy")}</p>
        <p><strong>To:</strong> {format(new Date(viewBooking.to), "dd MMM yyyy")}</p>
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={() => setViewBooking(null)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}