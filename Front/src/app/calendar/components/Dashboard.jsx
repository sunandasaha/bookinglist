"use client";

import { useState, useContext, useEffect } from "react";
import TopBar from "./TopBar";
import CalendarGrid from "./CalendarGrid";
import { Context } from "../../_components/ContextProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchBookingId, setSearchBookingId] = useState("");
  const { user, hosthotel } = useContext(Context);
  const navigate = useRouter();

  useEffect(() => {
    console.log(hosthotel);

    if (!user) {
      navigate.push("/");
    }
  }, []);

  // Sample bookings
  const [bookings, setBookings] = useState([
    { id: "BK123", date: "2025-06-10", room: "Room1", guest: "Alice" },
    { id: "BK456", date: "2025-06-11", room: "Room2", guest: "Bob" },
    { id: "BK789", date: "2025-06-12", room: "Room3", guest: "Charlie" },
  ]);
  const filteredBookings = searchBookingId
    ? bookings.filter(
        (b) => b.id.toLowerCase() === searchBookingId.toLowerCase()
      )
    : bookings;
  const handleSearch = (query) => {
    const trimmedQuery = query.trim();
    setSearchBookingId(trimmedQuery);
    if (!trimmedQuery) {
      return;
    }
    const found = bookings.some(
      (b) => b.id.toLowerCase() === trimmedQuery.toLowerCase()
    );
    if (!found) {
      alert("Booking ID not found");
      setSearchBookingId("");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      <TopBar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onSearch={handleSearch}
      />
      <CalendarGrid
        startDate={selectedDate}
        bookings={filteredBookings}
        searchBookingId={searchBookingId}
      />
      <Link href={"/test"}>Test</Link>
    </div>
  );
}
