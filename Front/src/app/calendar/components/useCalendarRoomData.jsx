"use client";

import { useContext, useState } from "react";
import { Context } from "../../_components/ContextProvider";

const useCalendarRoomData = () => {
  const { hosthotel } = useContext(Context);
  const [selectedRoom, setSelectedRoom] = useState(null);

  if (!hosthotel) {
    return { error: "No hotel data", rooms: [], selectedRoom, setSelectedRoom };
  }

  const isPerPerson = hosthotel.pay_per.person;
  const isPerRoom = hosthotel.pay_per.room;

  const rawCats = isPerPerson
    ? hosthotel.per_person_cat || []
    : isPerRoom
    ? hosthotel.room_cat || []
    : [];

  const allRoomNumbers = rawCats.flatMap((cat) =>
    isPerPerson ? cat.roomNumbers : cat.room_no
  );

  const expectedRoomCount = hosthotel.rooms || 0;
  const missingCount = expectedRoomCount - allRoomNumbers.length;

  const missingRooms = Array.from({ length: missingCount }, (_, i) => ({
    name: `Room ${allRoomNumbers.length + i + 1}`,
    isMissing: true,
  }));

  const processedRooms = rawCats.flatMap((cat) =>
    (isPerPerson ? cat.roomNumbers : cat.room_no).map((roomNo) => ({
      name: roomNo,
      isMissing: false,
      images: cat.images,
      amenities: cat.amenities,
      capacity: cat.capacity,
      rates: isPerPerson
        ? [cat.rate1, cat.rate2, cat.rate3, cat.rate4]
        : [cat.price],
      category: cat.name,
      advance: isPerPerson ? cat.advance : cat.advance,
      agentCommission: isPerPerson ? cat.agentCommission : cat.agent_com,
    }))
  );

  const rooms = [...processedRooms, ...missingRooms];

  const error = allRoomNumbers.length !== expectedRoomCount ? "Room count mismatch" : null;

  return { rooms, error, selectedRoom, setSelectedRoom };
};

export default useCalendarRoomData;
