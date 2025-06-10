"use client";
import { useContext, useMemo } from "react";
import { Context } from "../../_components/ContextProvider";

export default function useCalendarRoomData() {
  const { hosthotel } = useContext(Context);

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

  return rooms;
}
