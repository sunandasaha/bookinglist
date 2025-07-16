import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { X } from "lucide-react";
import { postReq, getReq } from "../../_utils/request";
import { useContext, useMemo } from "react";
import { Context } from "../../_components/ContextProvider";
export default function GuestBookingForm({ booking, onSave, onClose }) {
  if (!booking) return null;
  const { user, hosthotel } = useContext(Context);
  const [isEditing, setIsEditing] = useState(false);

  const token = user?.token;
  const hotelId = hosthotel?._id;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    adults: 1,
    children: 0,
    age_0_5: 0,
    age_6_10: 0,
    message: "Booking ID will be generated when you confirm the booking.",
  });

  const [errors, setErrors] = useState({ phone: "", whatsapp: "" });
  const [submitted, setSubmitted] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [customAdvance, setCustomAdvance] = useState(null);
  const [calcError, setCalcError] = useState("");

  const validatePhone = (number) => {
    const cleaned = number.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      return "Number must contain exactly 10 digits.";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "phone" || name === "whatsapp") {
      const errorMsg = validatePhone(value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
      let phoneError = "";
        if (formData.phone) {
          phoneError = validatePhone(formData.phone);
        }
    const whatsappError = validatePhone(formData.whatsapp);
    const childCount = Number(formData.children);
    const age0_5 = Number(formData.age_0_5);
    const age6_10 = Number(formData.age_6_10);
    let childError = "";
    if (childCount != age0_5 + age6_10) {
      childError = "Total children must match age 0–5 or  age 6–10";
    }
    setErrors({
      phone: phoneError,
      whatsapp: whatsappError,
      child: childError,
    });
    if (calcError) {
      return;
    }

    if (!phoneError && !whatsappError && !childError) {
      setSubmitted(true);
      setIsEditing(false);
    }
  };
  const { totalPrice, advanceAmount } = useMemo(() => {
    if (
      !hosthotel ||
      !booking?.roomNames?.length ||
      !booking.from ||
      !booking.to
    ) {
      return { totalPrice: 0, advanceAmount: 0 };
    }

    const selectedRooms = booking.roomNames;
    const nights =
      (new Date(booking.to).setHours(0, 0, 0, 0) -
        new Date(booking.from).setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24) +
      1;

    const adults = Number(formData.adults) || 0;
    const age_0_5 = Number(formData.age_0_5) || 0;
    const age_6_10 = Number(formData.age_6_10) || 0;
    const children = Number(formData.children) || 0;

    if (age_0_5 + age_6_10 !== children) {
      return { totalPrice: 0, advanceAmount: 0 };
    }
    // PER ROOM PRICING
    if (hosthotel?.pay_per?.room) {
      const selectedCats =
        hosthotel.room_cat?.filter((cat) =>
          cat.room_no?.some((room) => selectedRooms.includes(room))
        ) || [];

      if (!selectedCats.length) return { totalPrice: 0, advanceAmount: 0 };

      let totalBase = 0;
      let totalAdvance = 0;
      let totalCapacity = 0;
      let totalMaxCapacity = 0;
      const roomStats = [];
      selectedCats.forEach((cat) => {
        const roomCount = cat.room_no.filter((r) =>
          selectedRooms.includes(r)
        ).length;
        if (!roomCount) return;

        const capacity = cat.capacity || 0;
        const maxCap = capacity < 4 ? capacity + 1 : capacity;
        const rate = cat.price || 0;
        const extraRate = cat.price_for_extra_person || 0;

        totalCapacity += capacity * roomCount;
        totalMaxCapacity += maxCap * roomCount;
        totalBase += rate * roomCount * nights;
        if (cat.advance?.percent) {
          totalAdvance +=
            rate * roomCount * nights * (cat.advance.amount / 100);
        } else {
          totalAdvance += (cat.advance?.amount || 0) * roomCount * nights;
        }

        roomStats.push({
          capacity,
          maxCap,
          rate,
          extraRate,
          roomCount,
          advance: cat.advance,
        });
      });
      if (adults > totalMaxCapacity) {
        return {
          error: `Only ${totalMaxCapacity} adult(s) can be accommodated. ${
            adults - totalMaxCapacity
          } extra adult(s) cannot be accommodated.`,
          totalPrice: 0,
          advanceAmount: 0,
        };
      }
      let extraCharges = 0;
      const extraAdults = Math.max(0, adults - totalCapacity);
      if (extraAdults > 0) {
        roomStats.sort((a, b) => a.extraRate - b.extraRate);
        let remainingExtras = extraAdults;
        for (const room of roomStats) {
          const availableExtras =
            (room.maxCap - room.capacity) * room.roomCount;
          const assign = Math.min(availableExtras, remainingExtras);
          extraCharges += assign * room.extraRate * nights;
          if (room.advance?.percent) {
            totalAdvance +=
              assign * room.extraRate * nights * (room.advance.amount / 100);
          }
          remainingExtras -= assign;
          if (remainingExtras <= 0) break;
        }
      }
      const minPerAdultRate =
        roomStats.length > 0
          ? Math.min(...roomStats.map((r) => r.rate / r.capacity))
          : 0;
      const childCharge = age_6_10 * 0.5 * minPerAdultRate * nights;
      const childRateRoom = roomStats.find(
        (r) => r.rate / r.capacity === minPerAdultRate
      );
      if (childRateRoom) {
        if (childRateRoom.advance?.percent) {
          totalAdvance += childCharge * (childRateRoom.advance.amount / 100);
        }
      }
      return {
        totalPrice: parseFloat(
          (totalBase + extraCharges + childCharge).toFixed(2)
        ),
        advanceAmount: parseFloat(totalAdvance.toFixed(2)),
      };
    }
    // PER PERSON PRICING LOGIC
    if (hosthotel?.pay_per?.person) {
  const selectedCats =
    hosthotel.per_person_cat?.filter((cat) =>
      cat.roomNumbers?.some((room) => selectedRooms.includes(room))
    ) || [];

  if (selectedCats.length === 0) {
    return { totalPrice: 0, advanceAmount: 0 };
  }

  const roomStats = selectedRooms.map((roomNo) => {
    const cat = selectedCats.find((c) =>
      c.roomNumbers.includes(roomNo)
    );
    if (!cat) return null;
    const capacity = cat.capacity || 1;
    const maxCap = 4;
    return {
      roomNo,
      cat,
      assigned: 0,
      baseCap: capacity,
      maxCap,
    };
  }).filter(Boolean);

  let remaining = adults;

  // Assign base capacity first
  for (let room of roomStats) {
    const assign = Math.min(room.baseCap, remaining);
    room.assigned += assign;
    remaining -= assign;
  }

  // Round-robin assignment for remaining adults
  let i = 0;
  while (remaining > 0) {
    const room = roomStats[i % roomStats.length];
    if (room.assigned < room.maxCap) {
      room.assigned++;
      remaining--;
    }
    i++;
  }

  let totalBase = 0;
  let totalAdvance = 0;
  const rateDetails = [];

  for (const room of roomStats) {
    const { assigned, cat } = room;
    if (assigned < 1 || assigned > 4) continue;

    const perPersonRate = cat[`rate${assigned}`] || 0;
    const roomTotal = perPersonRate * assigned * nights;
    totalBase += roomTotal;

    if (cat.advance?.percent) {
      totalAdvance += roomTotal * (cat.advance.amount / 100);
    } else {
      totalAdvance += (cat.advance?.amount || 0) * nights;
    }

    rateDetails.push({ rate: perPersonRate, cat });
  }

  // Child pricing
  const age_6_10 = Number(formData.age_6_10) || 0;
  if (age_6_10 > 0 && rateDetails.length > 0) {
    const minRate = Math.min(...rateDetails.map(r => r.rate));
    const minCat = rateDetails.find(r => r.rate === minRate)?.cat;
    const childCharge = age_6_10 * minRate * nights * 0.5;
    totalBase += childCharge;

    if (minCat?.advance?.percent) {
      totalAdvance += childCharge * (minCat.advance.amount / 100);
    }
  }

  return {
    totalPrice: parseFloat(totalBase.toFixed(2)),
    advanceAmount: parseFloat(totalAdvance.toFixed(2)),
  };
}
    return { totalPrice: 0, advanceAmount: 0 };
  }, [
    hosthotel,
    booking,
    formData.adults,
    formData.children,
    formData.age_0_5,
    formData.age_6_10,
  ]);
  useEffect(() => {
    if (advanceAmount) {
      setCustomAdvance(advanceAmount);
    }
  }, [advanceAmount]);

  const handlePayment = async () => {
    const bookingPayload = {
      ...formData,
      hotelId,
      fromDate: booking.from,
      toDate: booking.to,
      rooms: booking.roomNames,
      adults: Number(formData.adults),
      children: Number(formData.children),
      age_0_5: Number(formData.age_0_5),
      age_6_10: Number(formData.age_6_10),
      totalPrice,
      advanceAmount: Number(customAdvance ?? advanceAmount),
    };

    try {
      const result = await postReq("guestbooking", bookingPayload, user.token);
      console.log(result);

      if (result.status === "success" && result.booking?._id) {
        const newId = result.booking._id;
        setBookingId(newId);
        setBookingConfirmed(true);
        alert(`🎉 Booking Confirmed!\nYour Booking ID is: ${newId}`);
        onSave(result.booking);
      } else {
        alert(
          "❌ Failed to save booking: " + (result.message || "Unknown error")
        );
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("❌ Error saving booking. Please try again.");
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4 pt-20">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm max-h-[85vh] overflow-auto mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-green-600">
            {bookingConfirmed ? "Booking Confirmed" : "Guest Booking"}
          </h3>
          <button onClick={() => onClose(null)} aria-label="Close modal">
            <X size={24} style={{ color: "red" }} />
          </button>
        </div>

        {(!submitted || isEditing) && (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 flex flex-col items-center"
          >
            <div className="bg-gray-100 p-3 rounded text-black w-full text-left">
              <p>
                <strong>Checkin:</strong> {format(booking.from, "MMM dd")} -{" "}
                <strong>Checkout:</strong>{" "}
                {format(addDays(booking.to, 1), "MMM dd")}
              </p>
              <p>
                <strong>Rooms:</strong> {booking.roomNames.join(", ")}
              </p>
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder=" * 👤Guest Name"
              required
              className="w-full max-w-xs p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder=" * 🏠Address"
              required
              className="w-full max-w-xs p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder=" 📞Phone Number(optional)"
                className={`w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 ${
                  errors.phone
                    ? "border-red-500 ring-red-500"
                    : "focus:ring-blue-500"
                }`}
              />
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder=" * 💬WhatsApp Number"
                required
                className={`w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 ${
                  errors.whatsapp
                    ? "border-red-500 ring-red-500"
                    : "focus:ring-blue-500"
                }`}
              />
            </div>

            {(errors.phone || errors.whatsapp) && (
              <div className="text-red-600 text-sm mt-1 max-w-xs w-full">
                {errors.phone && <p>📞 {errors.phone}</p>}
                {errors.whatsapp && <p>💬 {errors.whatsapp}</p>}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              <div>
                <label className="text-sm text-gray-600 ml-1">👨 Adults</label>
                <input
                  type="number"
                  name="adults"
                  onWheel={(e) => e.target.blur()}
                  value={formData.adults}
                  onChange={handleChange}
                  placeholder=" * Adults"
                  required
                  className="no-spinner w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {calcError && (
                <div className="text-red-600 text-sm mt-1 max-w-xs w-full">
                  <strong className="font-bold">⚠️ Warning:</strong>
                  <p>{calcError}</p>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-600 ml-1">
                  👶 Children
                </label>
                <input
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  name="children"
                  value={formData.children}
                  onChange={handleChange}
                  placeholder="Children"
                  required
                  className=" no-spinner w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errors.child && (
                <div className="text-red-600 text-sm mt-1 max-w-xs w-full">
                  <p>{errors.child}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              <div>
                <label className="text-sm text-gray-600 ml-1">🧒 Age 0–5</label>
                <input
                  type="number"
                  name="age_0_5"
                  onWheel={(e) => e.target.blur()}
                  value={formData.age_0_5 === 0 ? "" : formData.age_0_5} 
                  onChange={handleChange}
                  placeholder="Free"
                  className="no-spinner w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 ml-1">
                  👦 Age 6–10
                </label>
                <input
                  type="number"
                  name="age_6_10"
                  value={formData.age_6_10 === 0 ? "" : formData.age_6_10} 
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                  placeholder="half"
                  className="no-spinner w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <textarea
              readOnly
              name="message"
              rows={3}
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full max-w-xs p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="w-full max-w-xs bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </form>
        )}
        {submitted && !bookingConfirmed && !isEditing && (
          <div className="space-y-4 text-left text-black">
            <p>
              <strong>Name:</strong> {formData.name}
            </p>
            {formData.phone && (
              <p>
                <strong>Phone:</strong> {formData.phone}
              </p>
            )}
            <p>
              <strong>whatsapp:</strong> {formData.whatsapp}
            </p>
            <p>
              <strong>Adults:</strong> {formData.adults} |{" "}
              <strong>Children:</strong> {formData.children}
            </p>
            <p>
              <strong>0–5 yrs:</strong> {formData.age_0_5} |{" "}
              <strong>6–10 yrs:</strong> {formData.age_6_10}
            </p>
            <p>
              <strong>Checkin</strong> {format(booking.from, "MMM dd")} -{" "}
              <strong>Checkout</strong>{" "}
              {format(addDays(booking.to, 1), "MMM dd")}
            </p>
            <p>
              <strong>Rooms:</strong> {booking.roomNames.join(", ")}
            </p>
            <p>
              <strong>Message:</strong> {formData.message}
            </p>
            <p>
              <strong>Total Price:</strong> ₹
              {totalPrice ? totalPrice.toFixed(2) : 0}
            </p>
            <div className="w-full max-w-xs">
              <label className="text-sm text-gray-600 ml-1 font-semibold">
                Advance to Pay (editable)
              </label>
              <input
                type="number"
                name="customAdvance"
                onWheel={(e) => e.target.blur()}
                value={customAdvance ?? ""}
                onChange={(e) => setCustomAdvance(Number(e.target.value))}
                className="w-full p-3 mt-1 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full max-w-xs bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition"
            >
              ✏ Edit Details
            </button>

            <button
              onClick={handlePayment}
              className="w-full max-w-xs bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Confirm booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
