"use client";
import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { format, addDays, isWithinInterval } from "date-fns";
import clsx from "clsx";
import { User, Plus, } from "lucide-react";
import GuestBookingForm from "./GuestBookingForm";
import { site } from "../_utils/request";
import { Context } from "../_components/ContextProvider";
import RoomInfoPopup from "./RoomInfoPopup";

export default function CalendarGrid({ startDate }) {
  const [dates, setDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tappedCells, setTappedCells] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRoomName, setSelectedRoomName] = useState(null);
  const [hasBookedCellsInSelection, setHasBookedCellsInSelection] = useState(false);

  const { hosthotel, user } = useContext(Context);
  const containerRef = useRef(null);

  const getBookings = async () => {
    try {
      const res = await fetch(site + "guestbooking/bookings", {
        headers: {
          hotelid: hosthotel._id,
          sdate: startDate.toString() || "2025-06-20",
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
  const rooms = useMemo(() => {
    if (!hosthotel) return [];
    if (hosthotel.pay_per?.person && hosthotel.per_person_cat) {
      return hosthotel.per_person_cat.flatMap((cat) =>
        cat.roomNumbers.map((name) => ({
          name,
          category: cat.name,
          price: { one: cat.rate1 , two: cat.rate2, three: cat.rate3, four: cat.rate4 , },
          capacity: cat.capacity,
        }))
      );
    }
    if (hosthotel.pay_per?.room && hosthotel.room_cat) {
      return hosthotel.room_cat.flatMap((cat) =>
        cat.room_no.map((name) => ({
          name,
          category: cat.name,
          price: { rate: cat.price },
          capacity: cat.capacity,
        }))
      );
    }
    return [];
  }, [hosthotel]);

  useEffect(() => {
    if (startDate) {
      const next7Days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
      setDates(next7Days);
    }
  }, [startDate]);

  useEffect(() => {
    if (hosthotel?._id && startDate) getBookings();
  }, [hosthotel, startDate]);
   const getBookingForCell = (roomName, date) => {
    return bookings.find((b) => {
      if (b.room !== roomName) return false;
      const cellDate = new Date(date).setHours(0, 0, 0, 0);
      const fromDate = new Date(b.from).setHours(0, 0, 0, 0);
      const toDate = new Date(b.to).setHours(0, 0, 0, 0);
      
      return cellDate >= fromDate && cellDate <= toDate;
    });
  };
 const toggleCell = (r, d) => {
  const roomName = rooms[r]?.name;
  const date = dates[d];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cellDate = new Date(date);
  cellDate.setHours(0, 0, 0, 0);

  if (cellDate < today) {
    alert("Invalid date selection");
    return;
  }

  if (getBookingForCell(roomName, date)) {
    alert("Hey!! it is already booked");
    return;
  }
  setTappedCells((prev) => {
    const alreadySelected = prev.some(([x, y]) => x === r && y === d);
    const next = alreadySelected
      ? prev.filter(([x, y]) => !(x === r && y === d))
      : [...prev, [r, d]];

    const selectedDates = next
      .filter(([x]) => x === r)
      .map(([_, y]) => y)
      .sort((a, b) => a - b);

    if (selectedDates.length > 1) {
      const min = selectedDates[0];
      const max = selectedDates[selectedDates.length - 1];
      for (let i = min; i <= max; i++) {
        const isSelected = selectedDates.includes(i);
        const isBooked = getBookingForCell(roomName, dates[i]);

        if (!isSelected || isBooked) {
          alert("Dates Selection must be continuous and unbooked.");
          return prev;
        }
      }
    }
    const anyBooked = next.some(([x, y]) =>
      getBookingForCell(rooms[x].name, dates[y])
    );

    setHasBookedCellsInSelection(anyBooked);
    return next;
  });
};
const selectedCells = tappedCells;
const isSelected = (r, d) =>
    tappedCells.some(([x, y]) => x === r && y === d);
const handleBookClick = () => {
    if (selectedCells.length === 0) return;
    const roomToDates = new Map();
    selectedCells.forEach(([rIdx, dIdx]) => {
      if (!roomToDates.has(rIdx)) roomToDates.set(rIdx, []);
      roomToDates.get(rIdx).push(dIdx);
    });
    const fromToSet = new Set();
    for (const [rIdx, dateList] of roomToDates.entries()) {
      const sorted = dateList.sort((a, b) => a - b);
      const fromIdx = sorted[0];
      const toIdx = sorted[sorted.length - 1];
      fromToSet.add(`${fromIdx}-${toIdx}`);
    }
    if (fromToSet.size !== 1) {
      alert("All rooms must have same from and to dates.");
      return;
    }
    const [firstRoomIdx] = roomToDates.keys();
    const dateList = roomToDates.get(firstRoomIdx).sort((a, b) => a - b);
    const fromIdx = dateList[0];
    const toIdx = dateList[dateList.length - 1];
    const roomNames = [...roomToDates.keys()].map((rIdx) => rooms[rIdx].name);
    setSelectedBooking({
      from: format(dates[fromIdx], "yyyy-MM-dd"),
      to: format(dates[toIdx], "yyyy-MM-dd"),
      roomNames,
    });
};
const handleBookingSave = async () => {
    setSelectedBooking(null);
    setTappedCells([]); 
    await getBookings(); 
  };

  return (
    <div
      className="relative overflow-x-auto w-full bg-white"
      ref={containerRef}
    >
      <div className="inline-block min-w-max border rounded-xl shadow-xl select-none">
        <div className="grid grid-cols-[120px_repeat(7,70px)] bg-blue-900 text-white font-semibold">
          <div className=" text-center p-2 border-r sticky left-0 bg-blue-900  text-white text-sm sm:text-base font-medium">
            Tap Room <br />
            for info 👇 
        </div>
          {dates.map((date, i) => ( 
            <div key={i} className="p-2 text-center border-r">
              <div>{format(date, "EEE")}</div>
              <div>{format(date, "dd MMM")}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[120px_repeat(7,70px)] bg-blue-100 text-sm text-gray-800 font-medium">

          <div className="p-2 border-r sticky left-0 bg-blue-100">Availabile</div>
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
              <div key={i} className="p-2 bg-blue-100 text-center border-r">
                {free} 
              </div>
            );
          })}
        </div>
        {rooms.map((room, rIdx) => (
          <div
            key={room.name}
            className="grid border-t grid-row grid-cols-[120px_repeat(7,70px)]"
          >
            <div
              className="p-2 border-r bg-white sticky left-0 cursor-pointer"
              onClick={() => setSelectedRoomName(room.name)}
            >
              <div className = " flex  items-center text-blue-800  gap-1 font-bold text-l">Room {room.name}: <span className="flex items-center text-black">
                      <User size={13} className="mr-0.5" />
                      {room.capacity}
                    </span></div>
              <div className="text-xs text-gray-500">
                ₹
               {room.price?.one || room.price?.two || room.price?.three || room.price?.four ? (
                  room.capacity === 1 ? `${room.price.one} /person`
                  : room.capacity === 2 ? `${room.price.two} /person`
                  : room.capacity === 3 ? `${room.price.three} / person`
                  : `${room.price.four} / person`
                ) : (
                  `${room.price?.rate} / room`
                )}
              </div>
            </div>

            {dates.map((date, dIdx) => {
              const booking = getBookingForCell(room.name, date);
              const selected = isSelected(rIdx, dIdx);
              return (
                <div
                  key={dIdx}
                  className={clsx(
                    "border-r border-b px-1 py-2 text-[12px] flex justify-center items-center grid-cell",
                    selected && "bg-blue-300",
                    booking && "bg-green-500 text-white  cursor-not-allowed",
                    !booking && !selected && "hover:bg-blue-100",
                   )}
                   onClick={() => toggleCell(rIdx, dIdx)}
                  data-room={rIdx}
                  data-date={dIdx}
                >
                  {booking ? (
                    <div className="text-center">
                      <div className="font-medium">Booked</div>
                    </div>
                  ) : selected ? (
                    "Selected"
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
        {selectedCells.length > 0 && !selectedBooking && (
            <div className="fixed bottom-6 right-6  z-50">
                <button
                  onClick={handleBookClick}
                  disabled={hasBookedCellsInSelection}
                  className={clsx("Book w-15 h-15 rounded-full bg-blue-500 text-white flex items-center justify-center overflow-hidden",
                    hasBookedCellsInSelection? "bg-gray-400 cursor-not-allowed": "bg-blue-600 hover:bg-blue-700"
                   )}
                  >
                    <Plus sixe ={30} />
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
    </div>
  );
} 