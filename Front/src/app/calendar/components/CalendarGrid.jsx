"use client";
import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { format, addDays } from "date-fns";
import clsx from "clsx";
import GuestBookingForm from "./GuestBookingForm";
import { putReq, site } from "../../_utils/request";
import { Context } from "../../_components/ContextProvider";
import RoomInfoPopup from "./RoomInfoPopup";
import RescheduleModal from "./RescheduleModal";

export default function CalendarGrid({ startDate, searchBID, searchTrigger }) {
  const [dates, setDates] = useState([]);
  const [startCell, setStartCell] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [endCell, setEndCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [fetchedBooking, setFetchedBooking] = useState(null);
  const [selectedRoomName, setSelectedRoomName] = useState(null);
  const [hasBookedCellsInSelection, setHasBookedCellsInSelection] =
    useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const { hosthotel, user, pending, setPending } = useContext(Context);
  const containerRef = useRef(null);
  const getCellClass = (roomName, date, rIdx, dIdx) => {
    const booking = getBookingForCell(roomName, date);
    const selected = isSelected(rIdx, dIdx);

    return clsx(
      "border-r border-b p-2 text-xs flex justify-center items-center grid-cell",
      selected && "bg-blue-300",
      (booking?.confirmed === true) && "bg-green-500 text-white",
      (booking?.confirmed === false) && "bg-yellow-500 text-white",
      !booking && !selected && "hover:bg-blue-100"
    );
  };

  const getBookings = async () => {
    try {
      const res = await fetch(site + "guestbooking/bookingshost", {
        headers: {
          hotelid: hosthotel._id,
          sdate: startDate.toString() || "2025-06-20",
          authorization: user.token,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      const bookingsData = Array.isArray(data) ? data : data?.bookings || [];
      setBookings(
        bookingsData.map((b) => ({
          ...b,
          b_ID: b.booking_id,
          from: new Date(b.fromDate),
          to: new Date(b.toDate),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setBookings([]);
    }
  };
  const fetchBookingDetails = async (bookingId) => {
    try {
      const res = await fetch(site + `guestbooking/bookings/${bookingId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: user.token,
        },
      });

      const result = await res.json();
      if (result.status === "success") {
        setFetchedBooking(result.booking);
      } else {
        alert("No booking found for ID: " + bookingId);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };
  let actualRooms = [];
  const rooms = useMemo(() => {
    if (!hosthotel) return [];
    if (hosthotel.pay_per?.person && hosthotel.per_person_cat) {
      actualRooms = hosthotel.per_person_cat.flatMap((cat) =>
        cat.roomNumbers.map((name) => ({
          name,
          category: cat.name,
          price: { one: cat.rate1 , two: cat.rate2, three: cat.rate3, four: cat.rate4 , },
          capacity: cat.capacity,
          isDummy: false,
        }))
      );
    }
    if (hosthotel.pay_per?.room && hosthotel.room_cat) {
      actualRooms = hosthotel.room_cat.flatMap((cat) =>
        cat.room_no.map((name) => ({
          name,
          category: cat.name,
          price: { rate: cat.price },
          capacity: cat.capacity,
          isDummy: false,
        }))
      );
    }
    const total = hosthotel.rooms || 0;
    const missing = total - actualRooms.length;
    const dummyRooms = Array.from({ length: missing }, (_, i) => ({
      name: `${actualRooms.length + i + 1}`,
      category: "Unavailable",
      isDummy: true,
    }));
    return [...actualRooms, ...dummyRooms];
  }, [hosthotel]);

  useEffect(() => {
    if (startDate) {
      const next7Days = Array.from({ length: 7 }, (_, i) =>
        addDays(startDate, i)
      );
      setDates(next7Days);
    }
  }, [startDate]);

  useEffect(() => {
    if (hosthotel?._id && startDate) getBookings();
  }, [hosthotel, startDate, pending]);
  useEffect(() => {
    if (!searchBID) return;
    fetchBookingDetails(searchBID);
  }, [searchTrigger]);

  const getBookingForCell = (roomName, date) => {
    return bookings.find((b) => {
      if (!b.room.includes(roomName)) return false;
      const cellDate = new Date(date).setHours(0, 0, 0, 0);
      const fromDate = new Date(b.from).setHours(0, 0, 0, 0);
      const toDate = new Date(b.to).setHours(0, 0, 0, 0);
      return cellDate >= fromDate && cellDate <= toDate;
    });
  };

  const selectedCells = useMemo(() => {
    if (!startCell || !endCell) return [];
    const [r1, d1] = startCell;
    const [r2, d2] = endCell;
    const rMin = Math.min(r1, r2),
      rMax = Math.max(r1, r2);
    const dMin = Math.min(d1, d2),
      dMax = Math.max(d1, d2);

    let hasBookings = false;
    const cells = [];

    for (let r = rMin; r <= rMax; r++) {
      for (let d = dMin; d <= dMax; d++) {
        cells.push([r, d]);
        const roomName = rooms[r]?.name;
        const date = dates[d];
        if (getBookingForCell(roomName, date)) {
          hasBookings = true;
        }
      }
    }

    setHasBookedCellsInSelection(hasBookings);
    return cells;
  }, [startCell, endCell, bookings, rooms, dates]);

  const isSelected = (r, d) =>
    selectedCells.some(([x, y]) => x === r && y === d);

  const handleMouseDown = (r, d) => {
    if (isSelected(r, d)) {
      setStartCell(null);
      setEndCell(null);
      setIsDragging(false);
    } else {
      setStartCell([r, d]);
      setEndCell([r, d]);
      setIsDragging(true);
    }
  };

  const handleMouseEnter = (r, d) => {
    if (isDragging) setEndCell([r, d]);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleBookClick = () => {
    if (selectedCells.length === 0) return;
    const uniqueRooms = [...new Set(selectedCells.map(([r]) => r))];
    const dateIndices = selectedCells.map(([_, d]) => d);
    const fromDate = dates[Math.min(...dateIndices)];
    const toDate = dates[Math.max(...dateIndices)];
    const from = format(fromDate, "yyyy-MM-dd");
    const to = format(toDate, "yyyy-MM-dd");

    setSelectedBooking({
      from,
      to,
      roomNames: uniqueRooms.map((i) => rooms[i].name),
    });
  };
  const handleBookingSave = async () => {
    setSelectedBooking(null);
    setStartCell(null);
    setEndCell(null);
    await getBookings();
  };

  return (
    <div
      className="relative overflow-x-auto w-full bg-white"
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="inline-block min-w-max border rounded-xl shadow-xl select-none">
        <div className="grid grid-cols-[120px_repeat(7,70px)] bg-blue-600 text-white font-semibold">
          <div className="p-2 border-r sticky left-0 bg-blue-600">
            Room / Date
          </div>
          {dates.map((date, i) => (
            <div key={i} className="p-2 text-center border-r">
              <div>{format(date, "EEE")}</div>
              <div>{format(date, "dd MMM")}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[120px_repeat(7,70px)] bg-green-100 text-sm text-gray-800 font-medium">
          <div className="p-2 border-r sticky left-0 bg-gray-100">
            Availability
          </div>
          {dates.map((date, i) => {
            const dateStart = new Date(date).setHours(0, 0, 0, 0);
            let bookedCount = 0;
            let totalAvailableRooms = 0;

            for (let r = 0; r < rooms.length; r++) {
              const room = rooms[r];
              if (room.isDummy) continue;

              totalAvailableRooms++;

              const booking = bookings.find((b) => {
                if (!b.room.includes(room.name)) return false;
                const from = new Date(b.from).setHours(0, 0, 0, 0);
                const to = new Date(b.to).setHours(0, 0, 0, 0);
                return dateStart >= from && dateStart <= to;
              });

              if (booking) bookedCount++;
            }

            const free = totalAvailableRooms - bookedCount;

            return (
              <div key={i} className="p-2 bg-green-100 text-center border-r">
                {free} available
              </div>
            );
          })}
        </div>
        {rooms.map((room, rIdx) => (
          <div
            key={room.name}
            className="grid grid-cols-[120px_repeat(7,70px)] border-t grid-row"
          >
            <div
              className="p-2 border-r bg-white sticky left-0 cursor-pointer"
              onClick={() => {
                if (!room.isDummy) setSelectedRoomName(room.name);
              }}
            >
              <div>Room: {room.name}</div>
              <div className="text-xs text-gray-500">
                {room.price?.one ? (
                  room.capacity === 1 ? `${room.price.one} /person`
                  : room.capacity === 2 ? `${room.price.two} / person`
                  : room.capacity === 3 ? `${room.price.three} / person`
                  : `${room.price.four} per person`
                ) : (
                  `${room.price?.rate} per room`
                )}
              </div>
            </div>
            {dates.map((date, dIdx) => {
              const booking = getBookingForCell(room.name, date);
              const isDummy = room.isDummy;
              return (
                <div
                  key={dIdx}
                  className={clsx(
                    "border-r border-b p-2 text-xs flex justify-center items-center grid-cell",
                    isDummy && "bg-gray-300 text-gray-500 cursor-not-allowed",
                    !isDummy && getCellClass(room.name, date, rIdx, dIdx)
                  )}
                  onClick={() => {
                    if (isDummy) return;
                    if (booking) {
                      fetchBookingDetails(booking.booking_id);
                    } else {
                      handleMouseDown(rIdx, dIdx);
                    }
                  }}
                  onMouseEnter={() => !isDummy && handleMouseEnter(rIdx, dIdx)}
                  data-room={rIdx}
                  data-date={dIdx}
                >
                  {isDummy ? (
                    <span>Unavailable</span>
                  ) : booking ? (
                    <div className="text-center">
                      <div className="font-medium">Booked</div>
                    </div>
                  ) : isSelected(rIdx, dIdx) ? (
                    "Selected"
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
        {selectedCells.length > 0 && !selectedBooking && (
          <div className="fixed bottom-4 left-0 w-full flex text-center z-50 px-20">
              <button
                  onClick={handleBookClick}
                  disabled={hasBookedCellsInSelection}
                  className={clsx("w-full max-w-sm py-3 px-10 rounded-lg text-center  text-white font-semibold shadow-md",
                    hasBookedCellsInSelection? "bg-gray-400 cursor-not-allowed": "bg-blue-600 hover:bg-blue-700"
                  )}
              >
              Book
              </button>
            </div>
          )}
      </div>

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
      {fetchedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 relative max-w-md w-full">
            <button
              onClick={() => setFetchedBooking(null)}
              className="absolute top-2 right-3 text-red-500 font-bold text-xl"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-2 text-green-500">
              Booking Details
            </h2>
            <div>
              <strong className="text-blue-500">BID:</strong>{" "}
              {fetchedBooking._id}
            </div>
            <div>
              <strong className="text-blue-500">Name:</strong>{" "}
              {fetchedBooking.name}
            </div>
            <div>
              <strong className="text-blue-500">Phone:</strong>{" "}
              {fetchedBooking.phone}
            </div>
            <div>
              <strong className="text-blue-500">Room(s):</strong>{" "}
              {fetchedBooking.rooms?.join(", ")}
            </div>
            <div>
              <strong className="text-blue-500">Checkin:</strong>{" "}
              {format(new Date(fetchedBooking.fromDate), "dd MMM yyyy")}
            </div>
            <div>
              <strong className="text-blue-500">Checkout:</strong>{" "}
              {format(
                addDays(new Date(fetchedBooking.toDate), 1),
                "dd MMM yyyy"
              )}
            </div>
            <div>
              <strong className="text-blue-500">Adults:</strong>{" "}
              {fetchedBooking.adults},{" "}
              <strong className="text-blue-500">Children:</strong>{" "}
              {fetchedBooking.children}
            </div>
            <div>
              <strong className="text-blue-500">Total:</strong> ₹
              {fetchedBooking.totalPrice}
            </div>
            <div>
              <strong className="text-blue-500">Advance:</strong> ₹
              {fetchedBooking.advanceAmount}
            </div>
            {fetchedBooking.agent_Id && (
              <>
                <div className="border-t border-black-200 ">
                  <strong className="text-black-500">👤Agent:</strong>{" "}
                  {fetchedBooking.agent_Id.name}
                </div>
                <div>
                  <strong className="text-black-500">🏢Agency:</strong>{" "}
                  {fetchedBooking.agent_Id.agency}
                </div>
                <div>
                  <strong className="text-black-500"> 📍Location:</strong>{" "}
                  {fetchedBooking.agent_Id.location}
                </div>
                <div>
                  <strong className="text-black-500"> 💬whatsapp:</strong>{" "}
                  {fetchedBooking.agent_Id.ph1}
                </div>
                <div>
                  <strong className="text-black-500"> 💰Commission:</strong> ₹
                  {fetchedBooking.agentCut.toFixed(2)}
                </div>
              </>
            )}
            {(fetchedBooking.status === 1 || fetchedBooking.status === 4) && (
              <div className="mt-4 flex justify-center gap-3">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => {
                    console.log("Reschedule clicked", fetchedBooking._id);
                    setShowRescheduleModal(true);
                  }}
                >
                  Reschedule
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={async () => {
                    if (
                      confirm(
                        `Are you sure you want to cancel booking ID ${fetchedBooking._id}?`
                      )
                    ) {
                      console.log("Cancel confirmed", fetchedBooking._id);
                      const res = await putReq(
                        "guestbooking/status",
                        {
                          id: fetchedBooking._id,
                          can: true,
                        },
                        user.token
                      );
                      console.log(res);

                      if (res.success) {
                        setPending((p) => [...p]);
                        setFetchedBooking(null);
                      }
                    }
                  }}
                >
                  Cancel Booking
                </button>
              </div>
            )}

            {showRescheduleModal && fetchedBooking && (
              <RescheduleModal
                booking={fetchedBooking}
                onClose={() => {
                  setShowRescheduleModal(false);
                  setFetchedBooking(null);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
