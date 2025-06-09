"use client";
import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { format, addDays, isWithinInterval } from "date-fns";
import clsx from "clsx";
import GuestBookingForm from "./GuestBookingForm";
import { Context } from "../../_components/ContextProvider";
import useCalendarRoomData from "./useCalendarRoomData";

export default function CalendarGrid({ startDate }) {
  const [dates, setDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [popupRoomIndex, setPopupRoomIndex] = useState(null);

  const { room, error } = useCalendarRoomData(); // Your existing room data hook

  const { hosthotel } = useContext(Context);
  const containerRef = useRef(null);

  // Extract per person rooms array if available
  const perPersonRooms = useMemo(() => {
    if (!hosthotel?.per_person_cat || !hosthotel.per_person_cat.room_nos) return [];
    return hosthotel.per_person_cat.room_nos;
  }, [hosthotel]);

  // Show error if number of room_nos doesn't match hosthotel.rooms
  const roomCountMismatch = hosthotel?.rooms !== perPersonRooms.length;

  // Rooms to display: use perPersonRooms if length matches, else fallback to numbered rooms
  const rooms = useMemo(() => {
    if (roomCountMismatch) {
      // fallback rooms with generic names to keep grid intact
      return Array.from({ length: hosthotel?.rooms || 0 }, (_, i) => ({
        id: i + 1,
        name: `Room ${i + 1}`,
      }));
    }
    // else show actual room names from perPersonRooms
    return perPersonRooms.map((name, i) => ({
      id: i + 1,
      name,
    }));
  }, [hosthotel?.rooms, perPersonRooms, roomCountMismatch]);

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

  // Popup card close handler
  const closePopup = () => setPopupRoomIndex(null);

  // Simple image slider for popup card
  const [popupImageIndex, setPopupImageIndex] = useState(0);

  const popupRoomImages = useMemo(() => {
    if (
      popupRoomIndex === null ||
      !hosthotel?.per_person_cat ||
      !hosthotel.per_person_cat.photos
    )
      return [];

    // Assuming photos is an array of arrays per room:
    const photosList = hosthotel.per_person_cat.photos[popupRoomIndex];
    return photosList || [];
  }, [popupRoomIndex, hosthotel]);

  const nextPopupImage = () => {
    setPopupImageIndex((i) =>
      popupRoomImages.length === 0 ? 0 : (i + 1) % popupRoomImages.length
    );
  };

  const prevPopupImage = () => {
    setPopupImageIndex((i) =>
      popupRoomImages.length === 0
        ? 0
        : (i - 1 + popupRoomImages.length) % popupRoomImages.length
    );
  };

  return (
    <div
      className="w-full overflow-x-auto bg-white relative"
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Show error if mismatch */}
      {roomCountMismatch && (
        <div className="p-4 mb-2 text-red-700 bg-red-100 border border-red-300 rounded-md text-center font-semibold">
          Error: Number of rooms in per_person_cat ({perPersonRooms.length}) does not match registered room count ({hosthotel?.rooms}).
        </div>
      )}

      <div className="inline-block w-full min-w-[800px] sm:min-w-[900px] md:min-w-[900px] border rounded-xl shadow-xl select-none">
        {/* Header row */}
        <div className="grid grid-cols-[120px_repeat(7,1fr)] bg-blue-600 text-white font-semibold md:text-sm">
          <div className="p-2 md:p-3 border-r">Room / Date</div>
          {dates.map((date, i) => (
            <div key={i} className="p-2 md:p-3 text-center border-r">
              <div>{format(date, "EEE")}</div>
              <div>{format(date, "dd MMM")}</div>
            </div>
          ))}
        </div>

        {/* Availability row */}
        <div className="grid grid-cols-[120px_repeat(7,1fr)] bg-green-200 text-sm font-medium text-gray-800 border-b grid-row">
          <div className="p-2 md:p-3 border-r whitespace-nowrap">Available Rooms</div>
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
          const roomName = room.name;
          return (
            <div
              key={room.id}
              className="grid grid-cols-[120px_repeat(7,1fr)] text-sm border-t grid-row"
            >
              <div
                className="p-2 md:p-3 font-medium bg-white text-gray-800 border-r cursor-pointer hover:text-blue-700"
                onClick={() => {
                  setPopupRoomIndex(rIdx);
                  setPopupImageIndex(0);
                }}
              >
                {roomName}
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
                    data-room={rIdx}
                    data-date={dIdx}
                  >
                    {!booking && selected ? "Selected" : null}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Floating Book button */}
        {selectedCells.length > 0 && bookBtnPosition && !selectedBooking && (
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

      {/* Popup card for room info */}
      {popupRoomIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closePopup}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-lg w-full p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              aria-label="Close popup"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-4">
              Room: {rooms[popupRoomIndex]?.name}
            </h3>

            {/* Image slider */}
            {popupRoomImages.length > 0 ? (
              <div className="relative">
                <img
                  src={popupRoomImages[popupImageIndex]}
                  alt={`Room ${rooms[popupRoomIndex]?.name} Image ${popupImageIndex + 1}`}
                  className="w-full h-48 object-cover rounded-md"
                />
                {popupRoomImages.length > 1 && (
                  <>
                    <button
                      onClick={prevPopupImage}
                      className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextPopupImage}
                      className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                No images available.
              </div>
            )}

            {/* Room info section - you can expand with more details here */}
            <div className="mt-4">
              <p>
                {/* Example room info */}
                Capacity:{" "}
                {hosthotel?.per_person_cat?.capacity?.[popupRoomIndex] || "N/A"}
              </p>
              <p>
                Agent Commission:{" "}
                {hosthotel?.per_person_cat?.agent_commission?.[popupRoomIndex] || "N/A"}
              </p>
              <p>
                Advance:{" "}
                {hosthotel?.per_person_cat?.advance?.[popupRoomIndex] || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
