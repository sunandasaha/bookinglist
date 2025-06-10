"use client";

import { useContext, useMemo } from "react";
import { Context } from "../../_components/ContextProvider";
import { site } from "../../_utils/request";

export default function RoomInfoPopup({ roomName }) {
  const { hosthotel } = useContext(Context);

  const roomData = useMemo(() => {
    if (!hosthotel) return null;

    // --- Per Person Pricing ---
    if (hosthotel.pay_per?.person && hosthotel.per_person_cat) {
      for (const cat of hosthotel.per_person_cat) {
        if (cat.roomNumbers.includes(roomName)) {
          return {
            category: cat.name,
            images: cat.images,
            capacity: cat.capacity,
            advance: cat.advance,
            commission: cat.agentCommission,
            price: {
              one: cat.rate1,
              two: cat.rate2,
              three: cat.rate3,
              four: cat.rate4,
            },
            amenities: cat.amenities,
          };
        }
      }
    }

    // --- Per Room Pricing ---
    else if (hosthotel.pay_per?.room && hosthotel.room_cat) {
      for (const cat of hosthotel.room_cat) {
        if (cat.room_no.includes(roomName)) {
          return {
            category: cat.name,
            images: cat.images,
            capacity: cat.capacity,
            advance: cat.advance,
            commission: cat.agent_com,
            price: { rate: cat.price },
            amenities: cat.amenities,
            extraPerson: cat.price_for_extra_person,
          };
        }
      }
    }

    return null;
  }, [hosthotel, roomName]);

  if (!roomData) return <div className="p-4">Room details not found.</div>;

  return (
    <div className="p-4 w-full max-w-md bg-white rounded-xl shadow-lg space-y-4">
      <div className="text-lg font-semibold">{roomName}</div>
      <div className="text-sm text-gray-600">Category: {roomData.category}</div>

      {/* Images Slider */}
      <div className="flex overflow-x-auto space-x-2">
        {roomData.images.map((img, idx) => (
          <img
            key={idx}
            src={site + "imgs/" + img}
            alt={`Room image ${idx + 1}`}
            className="w-32 h-24 rounded-lg object-cover"
          />
        ))}
      </div>

      {/* Details */}
      <div className="text-sm text-gray-700">
        <div>
          <strong>Capacity:</strong> {roomData.capacity} persons
        </div>
        {roomData.advance && (
          <div>
            <strong>Advance:</strong> {roomData.advance.amount}{" "}
            {roomData.advance.percent ? "%" : "Rs"}
          </div>
        )}
        {roomData.commission && (
          <div>
            <strong>Agent Commission:</strong> {roomData.commission.amount}{" "}
            {roomData.commission.percent ? "%" : "Rs"}
          </div>
        )}

        {roomData.price.rate && (
          <div>
            <strong>Rate:</strong> ₹{roomData.price.rate}
          </div>
        )}
        {roomData.price.one && (
          <div>
            <strong>Rates (Per Person):</strong>
            <ul className="ml-4 list-disc">
              <li>1 person: ₹{roomData.price.one}</li>
              <li>2 persons: ₹{roomData.price.two}</li>
              <li>3 persons: ₹{roomData.price.three}</li>
              <li>4 persons: ₹{roomData.price.four}</li>
            </ul>
          </div>
        )}

        {roomData.extraPerson && (
          <div>
            <strong>Extra Person:</strong> ₹{roomData.extraPerson}
          </div>
        )}

        {roomData.amenities?.length > 0 && (
          <div>
            <strong>Amenities:</strong>
            <ul className="ml-4 list-disc">
              {roomData.amenities.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
