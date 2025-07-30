"use client";
import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { format, addDays } from "date-fns";
import clsx from "clsx";
import {Home, User,Users,Building2, Plus,BedDouble,Phone,Wallet,MapPin, CalendarCheck,CalendarX,IndianRupee,UserRound,CalendarPlus,
  CalendarMinus,BadgeCheck,
  MessageCircle, } from "lucide-react";
import GuestBookingForm from "./GuestBookingForm";
import { forwardRef, useImperativeHandle } from "react";
import { putReq, site } from "../../_utils/request";
import { Context } from "../../_components/ContextProvider";
import RoomInfoPopup from "./RoomInfoPopup";
import RescheduleModal from "./RescheduleModal";
const waitForElement = (selector, timeout = 3000) =>
  new Promise((resolve) => {
    const interval = setInterval(() => {
      if (document.querySelector(selector)) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
    setTimeout(() => clearInterval(interval), timeout);
  });
const waitForEvent = (eventName) =>
  new Promise((resolve) => {
    const handler = () => {
      document.removeEventListener(eventName, handler);
      resolve();
    };
    document.addEventListener(eventName, handler);
  });

const CalendarGrid = forwardRef(({ startDate, searchBID, searchTrigger }, ref) => {
  const [dates, setDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tappedCells, setTappedCells] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [fetchedBooking, setFetchedBooking] = useState(null);
  const [selectedRoomName, setSelectedRoomName] = useState(null);
  const [hasBookedCellsInSelection, setHasBookedCellsInSelection] =useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const { hosthotel, user, pending, setPending } = useContext(Context);
  const [tourCompleted, setTourCompleted] = useState(false);
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
}, [hosthotel]);

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
  const toggleCell = (r, d) => {
  const roomName = rooms[r]?.name;
  const date = dates[d];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const booking = getBookingForCell(roomName, date);
  const cellDate = new Date(date);
  cellDate.setHours(0, 0, 0, 0);
  if (cellDate < today) {
    if (!booking) {
      alert("Invalid date selection");
      return;
    } else {
      fetchBookingDetails(booking.b_ID);
      return;
    }
  }
if (booking) {
  fetchBookingDetails(booking.b_ID); 
  return;
}
if (rooms[r]?.isDummy) {
  alert("🚫 This room is not available. Please go to the 'Rooms & Pricing' section in the sidebar to make it available for booking.");
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
   document.dispatchEvent(new Event("cellTapped"));

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
   document.dispatchEvent(new Event("bookingStarted"));

};
  const handleBookingSave = async () => {
    setSelectedBooking(null);
    setTappedCells([]);
    await getBookings();
  };
 const tourStarted = useRef(false);
const startCalendarTour = async () => {
  if (tourStarted.current) return;
  tourStarted.current = true;
  const introJs = (await import("intro.js")).default;
  await waitForElement(".room-column .sticky.left-0");
  const introRoom = introJs();
  introRoom.setOptions({
    steps: [
      {
        element: ".room-column .sticky.left-0",
        intro: "Tap on Room name to view room info.",
        position: "right",
      },
    ],
    showButtons: true,
    exitOnOverlayClick: false,
    exitOnEsc: false,
  });
  await new Promise((resolve) => {
    introRoom.oncomplete(resolve);
    introRoom.onexit(resolve);
    introRoom.start();
  });
  await waitForElement(".grid-cell");
  const cellTour = introJs();
  cellTour.setOptions({
    steps: [
      {
        element: ".grid-cell:not(.bg-gray-300)",
        intro: "📅 Tap on available dates to begin booking.",
        position: "bottom",
        disableInteraction: false,
      },
    ],
    showButtons: false,
    exitOnOverlayClick: false,
    exitOnEsc: false,
  });

  cellTour.start();
  await waitForEvent("cellTapped");
  cellTour.exit();
  await waitForElement("button.Book");
  const bookBtn = document.querySelector("button.Book");
  if (!bookBtn) return;

  const bookTour = introJs();
  bookTour.setOptions({
    steps: [
      {
        element: bookBtn,
        intro: `
          you can click <strong>Book</strong> to open the guest form and complete the booking.`,
        position: "top",
        disableInteraction: false,
        highlightClass: "click-through",
      },
      {
        intro: `
          🎉 <strong>Hurray! You're done with the steps.</strong><br/>
          You can now manage bookings using this calendar easily.`,
      },
    ],
    showButtons: true,
    exitOnOverlayClick: false,
    exitOnEsc: false,
    showStepNumbers: false,
  });
  bookTour.oncomplete(() => {
  setTappedCells([]);
  setTourCompleted(true);           
});

bookTour.onexit(() => {
  setTappedCells([]);
  setTourCompleted(true);          
});


  bookTour.start();
};

useImperativeHandle(ref, () => ({
  startTour: () => startCalendarTour(),
}));

  return (
    <div
      className="relative overflow-x-auto w-full bg-white"
      ref={containerRef}
    >
      <div className="inline-block min-w-max border rounded-xl shadow-xl select-none">
        <div className="grid grid-cols-[100px_repeat(7,60px)] sm:grid-cols-[150px_repeat(7,90px)] bg-blue-900 text-white font-semibold">
          <div className=" text-center p-2 border-r sticky left-0 bg-blue-900  text-white text-sm sm:text-base font-medium">
            Tap Room <br />
            for info 👇 
        </div>
          {dates.map((date, i) => (
            <div key={i} className="p-2 text-center border-r">
              <div>{format(date, "EEE")}</div>
              <div>{format(date, "dd ")}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[100px_repeat(7,60px)] sm:grid-cols-[150px_repeat(7,90px)] bg-blue-100 text-sm text-gray-800 font-medium">
          <div className="p-2 border-r sticky left-0 bg-blue-100">
            Available
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
              <div key={i} className="p-2 bg-blue-100 text-center border-r">
                {free} 
              </div>
            );
          })}
        </div>
        {rooms.map((room, rIdx) => (
          <div
            key={`room-${room.name}-${rIdx}`}
            className="grid grid-cols-[100px_repeat(7,60px)] sm:grid-cols-[150px_repeat(7,90px)] border-t grid-row room-column"
          >
            <div
              className="p-2 border-r bg-white sticky left-0 cursor-pointer"
              onClick={() => {
                if (!room.isDummy) setSelectedRoomName(room.name);
              }}
            >
             <div className = " flex  items-center text-blue-800  gap-1 font-bold text-l"><Home size={13} /> {room.name}: <span className="flex items-center text-black">
                      <User size={13} className="mr-0.5" />
                      {room.capacity}
                    </span></div>
              <div className="text-xs text-gray-600 flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
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
              const isDummy = room.isDummy;
              return (
                <div
                  key={dIdx}
                  className={clsx(
                    "border-r border-b p-2 text-xs flex justify-center items-center grid-cell",
                    isDummy && "bg-gray-300 text-gray-500 cursor-not-allowed",
                    !isDummy && getCellClass(room.name, date, rIdx, dIdx)
                  )}
                  onClick={() => toggleCell(rIdx, dIdx)}
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
            <div className="fixed bottom-6 right-6  z-50">
                <button
                  onClick={handleBookClick}
                  disabled={hasBookedCellsInSelection}
                  className={clsx("Book w-15 h-15 rounded-full bg-blue-500 text-white flex items-center justify-center overflow-hidden",
                    hasBookedCellsInSelection? "bg-gray-400 cursor-not-allowed": "bg-blue-600 hover:bg-blue-700"
                   )}
                  >
                    <Plus size ={30} />
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
    <div className="bg-white rounded-xl shadow-lg p-6 relative max-w-md w-full text-sm">
      <button
        onClick={() => setFetchedBooking(null)}
        className="absolute top-2 right-3 text-red-500 font-bold text-xl"
      >
        ×
      </button>

      <h2 className="text-xl text-center font-semibold mb-4 text-blue-900">
        Booking Details
      </h2>

      <div className="space-y-2 text-black">
        <div className="flex items-center gap-2">
          <CalendarCheck size={16} className="text-green-800" />
          <span className="font-semibold text-blue-900">BID:</span>
          <span className="text-slate-800">{fetchedBooking._id}</span>
        </div>

        <div className="flex items-center gap-2">
          <UserRound size={16} className="text-blue-900" />
          <span className="font-semibold text-blue-900">Name:</span>
          <span className="text-slate-800">{fetchedBooking.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Phone size={16} className="text-green-900" />
          <span className="font-semibold text-blue-900">Phone:</span>
          <span className="text-slate-800">{fetchedBooking.phone}</span>
        </div>

        <div className="flex items-center gap-2">
          <BedDouble size={16} className="text-blue-900" />
          <span className="font-semibold text-blue-900">Room(s):</span>
          <span className="text-slate-800">{fetchedBooking.rooms?.join(", ")}</span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarPlus size={16} className="text-green-900" />
          <span className="font-semibold text-blue-900">Check-in:</span>
          <span className="text-slate-800">
            {format(new Date(fetchedBooking.fromDate), "dd MMM yyyy")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarMinus size={16} className="text-blue-900" />
          <span className="font-semibold text-blue-900">Check-out:</span>
          <span className="text-slate-800">
            {format(addDays(new Date(fetchedBooking.toDate), 1), "dd MMM yyyy")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Users size={16} className="text-green-900" />
          <span className="font-semibold text-blue-900">Adults:</span>
          <span className="text-slate-800">{fetchedBooking.adults}</span>
          <span className="font-semibold text-blue-900">Children:</span>
          <span className="text-slate-800">{fetchedBooking.children}</span>
        </div>

        <div className="flex items-center gap-2">
          <IndianRupee size={16} className="text-blue-900" />
          <span className="font-semibold text-blue-900">Total:</span>
          <span className="text-slate-800">₹{fetchedBooking.totalPrice}</span>
        </div>

        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-green-900" />
          <span className="font-semibold text-blue-900">Advance:</span>
          <span className="text-slate-800">₹{fetchedBooking.advanceAmount}</span>
        </div>
        <div className="flex items-center gap-2">
              <Wallet size={16} className="text-blue-900" />
              <span className="font-semibold text-blue-900">Balance:</span>
              <span className="text-slate-800">
                  ₹
                  {fetchedBooking.totalPrice - (fetchedBooking.agentCut || 0) - fetchedBooking.advanceAmount}
                </span>
          </div>

        {fetchedBooking.agentCut != null && (
          <>
            <div className="flex items-center gap-2">
              <BadgeCheck size={16} className="text-green-900" />
              <span className="font-semibold text-blue-900">Agent Pay:</span>
              <span className="text-slate-800">
                ₹{fetchedBooking.totalPrice - fetchedBooking.agentCut}
              </span>
            </div>
          </>
        )}
        {fetchedBooking.agent_Id && (
          <div className="pt-3 border-t border-gray-200 space-y-1">
            <div className="flex items-center gap-2">
              <User size={16} className="text-blue-900" />
              <span className="font-semibold text-blue-900">Agent:</span>{" "}
              <span className="text-slate-800">{fetchedBooking.agent_Id.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-green-900" />
              <span className="font-semibold text-blue-900"> Agency:</span>{" "}
              <span className="text-slate-800">{fetchedBooking.agent_Id.agency}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-900" />
              <span className="font-semibold text-blue-900">Location:</span>{" "}
              <span className="text-slate-800">{fetchedBooking.agent_Id.location}</span>
            </div>
             <div className="flex items-center gap-2">
              <MessageCircle size={16} className="text-green-900" />
              <span className="font-semibold text-blue-900"> WhatsApp:</span>{" "}
              <span className="text-slate-800">{fetchedBooking.agent_Id.ph1}</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee size={16} className="text-blue-900" />
              <span className="font-semibold text-blue-900"> Commission:</span>{" "}
              <span className="text-slate-800">₹{fetchedBooking.agentCut.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          className="bg-blue-900 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          onClick={() => setShowRescheduleModal(true)}
        >
          Reschedule
        </button>
        <button
          className="bg-red-900 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
          onClick={async () => {
            if (confirm(`Are you sure you want to cancel booking ID ${fetchedBooking._id}?`)) {
              const res = await putReq(
                "guestbooking/status",
                { id: fetchedBooking._id, can: true },
                user.token
              );
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

      {showRescheduleModal && (
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
});

export default CalendarGrid;

