"use client";

import { useState } from "react";
import TopBar from "./TopBar";
import CalendarGrid from "./CalendarGrid";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      <TopBar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <CalendarGrid startDate={selectedDate} />
    </div>
  );
}
