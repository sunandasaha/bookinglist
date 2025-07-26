import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import {User, Baby, X } from "lucide-react";
import { postReq, getReq } from "../../_utils/request";
import { useContext, useMemo } from "react";
import { Context } from "../../_components/ContextProvider";
export default function GuestBookingForm({ booking, onSave, onClose }) {
  if (!booking) return null;
  const { user, hosthotel } = useContext(Context);
  const [isEditing, setIsEditing] = useState(false);
  const token = user?.token;
  const hotelId = hosthotel?._id;
  const pay_per = hosthotel?.pay_per;
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
  if (childCount !== age0_5 + age6_10) {
    childError = "Total children must match age 0–5 or age 6–10";
  }
  const Maxerror = error || "";
  const newErrors = {
    phone: phoneError,
    whatsapp: whatsappError,
    child: childError,
    max: Maxerror,
  };
  setErrors(newErrors);
  const hasAnyError = Object.values(newErrors).some((err) => err);
  if (hasAnyError) {
    return;
  }
  setSubmitted(true);
  setIsEditing(false);
};

 const { totalPrice, advanceAmount, error } = useMemo(() => {
  const selectedRooms = booking?.roomNames || [];
  const nights =
    (new Date(booking?.to).setHours(0, 0, 0, 0) -
      new Date(booking?.from).setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24) + 1;
  const adults = Number(formData.adults) || 0;
  const age_0_5 = Number(formData.age_0_5) || 0;
  const age_6_10 = Number(formData.age_6_10) || 0;
  const children = Number(formData.children) || 0;
  if (!hosthotel || !selectedRooms.length || !booking.from || !booking.to || age_0_5 + age_6_10 !== children) {
    return { totalPrice: 0, advanceAmount: 0 };
  }
  const getMaxCap = (cap) => (cap === 2 ? 3 : cap === 3 ? 4 : 4);
  // PER ROOM PRICING
  if (hosthotel?.pay_per?.room) {
    const selectedCats = hosthotel.room_cat?.filter(cat =>
      cat.room_no?.some(room => selectedRooms.includes(room))
    ) || [];
    const roomStats = [];
    let totalCapacity = 0, totalMaxCapacity = 0;
    selectedCats.forEach(cat => {
      const roomCount = cat.room_no.filter(r => selectedRooms.includes(r)).length;
      if (!roomCount) return;
      const capacity = cat.capacity || 0;
      const maxCap = getMaxCap(capacity);
      totalCapacity += capacity * roomCount;
      totalMaxCapacity += maxCap * roomCount;
      roomStats.push({ capacity, maxCap, rate: cat.price || 0, extraRate: cat.price_for_extra_person || 0, roomCount, advance: cat.advance });
    });
    if (adults > totalMaxCapacity) {
      return { error: `Only ${totalMaxCapacity} adult(s) can be accommodated. Please select more rooms.`, totalPrice: 0, advanceAmount: 0 };
    }
    const roomAssignments = [];
    let remainingAdults = adults;
    roomStats.forEach(room => {
      for (let i = 0; i < room.roomCount; i++) {
        const base = Math.min(remainingAdults, room.capacity);
        roomAssignments.push({ base, extra: 0, room });
        remainingAdults -= base;
      }
    });
    let i = 0;
    while (remainingAdults > 0) {
      const current = roomAssignments[i % roomAssignments.length];
      const maxExtras = current.room.maxCap - current.room.capacity;
      if (current.extra < maxExtras) {
        current.extra++;
        remainingAdults--;
      }
      i++;
      if (i > roomAssignments.length * 2) break;
    }
    if (remainingAdults > 0) {
      return { error: `Only ${totalMaxCapacity} adult(s) can be accommodated. Please choose more rooms.`, totalPrice: 0, advanceAmount: 0 };
    }
    let totalPrice = 0, totalAdvance = 0;
    roomAssignments.forEach(({ base, extra, room }) => {
      const baseCost = room.rate * nights;
      const extraCost = room.extraRate * extra * nights;
      const total = baseCost + extraCost;
      totalPrice += total;
      totalAdvance += room.advance?.percent
        ? total * (room.advance.amount / 100)
        : (room.advance?.amount || 0) * nights;
    });
    if (age_6_10 > 0) {
      const minPerAdultRate = Math.min(...roomStats.map(r => r.rate / r.capacity));
      const childCharge = age_6_10 * 0.5 * minPerAdultRate * nights;
      totalPrice += childCharge;

      const childAdvanceRoom = roomStats.find(r => r.rate / r.capacity === minPerAdultRate);
      if (childAdvanceRoom?.advance?.percent) {
        totalAdvance += childCharge * (childAdvanceRoom.advance.amount / 100);
      }
    }

    return {
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      advanceAmount: parseFloat(totalAdvance.toFixed(2)),
    };
  }
  // PER PERSON PRICING
  if (hosthotel?.pay_per?.person) {
    const selectedCats = hosthotel.per_person_cat?.filter(cat =>
      cat.roomNumbers?.some(room => selectedRooms.includes(room))
    ) || [];

    const roomStats = selectedRooms.map(roomNo => {
      const cat = selectedCats.find(c => c.roomNumbers.includes(roomNo));
      if (!cat) return null;

      const baseCap = cat.capacity || 1;
      return {
        roomNo,
        cat,
        assigned: 0,
        baseCap,
        maxCap: getMaxCap(baseCap),
      };
    }).filter(Boolean);

    let remaining = adults;
    roomStats.forEach(room => {
      const assign = Math.min(room.baseCap, remaining);
      room.assigned += assign;
      remaining -= assign;
    });

    let i = 0;
    while (remaining > 0) {
      const room = roomStats[i % roomStats.length];
      if (room.assigned < room.maxCap) {
        room.assigned++;
        remaining--;
      }
      i++;
      if (i > roomStats.length * 2) break;
    }

    if (remaining > 0) {
      const totalMax = roomStats.reduce((acc, r) => acc + r.maxCap, 0);
      return {
        error: `Only ${totalMax} adult(s) can be accommodated. Please choose more rooms.`,
        totalPrice: 0,
        advanceAmount: 0,
      };
    }

    let totalBase = 0, totalAdvance = 0;
    const rateDetails = [];

    for (const room of roomStats) {
      const { assigned, cat } = room;
      const rate = cat[`rate${assigned}`] || 0;
      const roomTotal = rate * assigned * nights;
      totalBase += roomTotal;

      totalAdvance += cat.advance?.percent
        ? roomTotal * (cat.advance.amount / 100)
        : (cat.advance?.amount || 0) * nights;

      rateDetails.push({ rate, cat });
    }

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
}, [hosthotel, booking, formData.adults, formData.children, formData.age_0_5, formData.age_6_10]);
useEffect(() => {
  if (advanceAmount) setCustomAdvance(advanceAmount);
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
            <h3 className="text-xl font-bold text-blue-900">
            {bookingConfirmed ? "Booking Confirmed" : "Guest Booking"}
          </h3>
          <button onClick={() => onClose(null)} aria-label="Close modal">
            <X size={24} className = "text-gray-500 hover:text-black" />
          </button>
        </div>
        {(!submitted || isEditing) && (
            <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
                <div className="bg-blue-100 p-3 rounded text-black w-full text-left text-sm">
                  <p>
                    <strong className="text-blue-900">Checkin:</strong> {format(booking.from, "MMM dd")} -{" "}
                    <strong  className="text-blue-900">Checkout:</strong> {format(addDays(booking.to, 1), "MMM dd")}
                  </p>
                  <p>
                    <strong  className="text-blue-900">Rooms:</strong> {booking.roomNames.join(", ")}
                  </p>
                </div>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="* 👤 Guest Name"
                  required
                  className="w-full max-w-xs p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="* 🏠 Address"
                  required
                  className="w-full max-w-xs p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="* 📞 Phone "
                    className={`p-3 border rounded-lg text-black focus:outline-none focus:ring-2 ${
                      errors.phone ? "border-red-500 ring-red-500" : "focus:ring-blue-500"
                    }`}
                  />
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="* 💬 WhatsApp"
                    required
                    className={`p-3 border rounded-lg text-black focus:outline-none focus:ring-2 ${
                      errors.whatsapp ? "border-red-500 ring-red-500" : "focus:ring-blue-500"
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
                    <label className="flex items-center gap-1 text-sm text-gray-600 ml-1"><span className="text-blue-900"><User size ={20} /></span> Adults</label>
                    <input
                      type="number"
                      name="adults"
                      value={formData.adults}
                      onChange={handleChange}
                      onWheel={(e) => e.target.blur()}
                      placeholder="* Adults"
                      required
                      className="no-spinner w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-sm text-gray-600 ml-1"><span className="text-blue-900"><Baby size ={20} /></span>  Children</label>
                    <input
                      type="number"
                      name="children"
                      value={formData.children}
                      onChange={handleChange}
                      onWheel={(e) => e.target.blur()}
                      placeholder="Children"
                      className="no-spinner w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {errors.max && <p className="text-red-600 text-sm">{errors.max}</p>}
                {errors.child && <p className="text-red-600 text-sm">{errors.child}</p>}

                <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                  <div>
                    <label className="flex items-center gap-1 text-sm text-gray-600 ml-1"><span className="text-blue-900"><Baby size ={20} /></span>  Age 0–5</label>
                    <input
                      type="number"
                      name="age_0_5"
                      value={formData.age_0_5 === 0 ? "" : formData.age_0_5}
                      onChange={handleChange}
                      placeholder={pay_per?.person ? "Free" : ""}
                      onWheel={(e) => e.target.blur()}
                      className="no-spinner w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1  text-sm text-gray-600 ml-1"><span className="text-blue-900"><Baby size ={20} /></span>  Age 6–10</label>
                    <input
                      type="number"
                      name="age_6_10"
                      value={formData.age_6_10 === 0 ? "" : formData.age_6_10}
                      onChange={handleChange}
                      placeholder={pay_per?.person ? "Half Cost" : ""}
                      onWheel={(e) => e.target.blur()}
                      className="no-spinner w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full max-w-xs p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="submit"
                  className="w-full max-w-md bg-blue-900 text-white py-3 rounded-full hover:bg-blue-600 transition"
                >
                  Submit
                </button>
              </form>
        )}
        {submitted && !bookingConfirmed && !isEditing && (
          <div className="space-y-4 text-left text-black">
            <p>
              <strong className="text-blue-900">Name:</strong> {formData.name}
            </p>
            <p>
              <strong className="text-blue-900">Phone:</strong> {formData.phone}
            </p>
            <p>
              <strong className="text-blue-900">whatsapp:</strong> {formData.whatsapp}
            </p>
            <p>
              <strong className="text-blue-900">Adults:</strong> {formData.adults} |{" "}
              <strong className="text-blue-900">Children:</strong> {formData.children}
            </p>
            <p>
              <strong className="text-blue-900">0–5 yrs:</strong> {formData.age_0_5} |{" "}
              <strong className="text-blue-900">6–10 yrs:</strong> {formData.age_6_10}
            </p>
            <p>
              <strong className="text-blue-900">Checkin:</strong> {format(booking.from, "MMM dd")} -{" "}
              <strong className="text-blue-900">Checkout:</strong>{" "}
              {format(addDays(booking.to, 1), "MMM dd")}
            </p>
            <p>
              <strong className="text-blue-900">Rooms:</strong> {booking.roomNames.join(", ")}
            </p>
            <p>
              <strong className="text-blue-900">Message:</strong> {formData.message}
            </p>
            <p>
              <strong className="text-blue-900">Total Price:</strong> ₹
              {totalPrice ? totalPrice.toFixed(2) : 0}
            </p>
            <p>
              <strong className="text-blue-900">Advance to Pay:</strong> ₹
              {advanceAmount ? advanceAmount.toFixed(2) : 0}
            </p>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full px-7 py-2 bg-white-900 text-black border border-blue-600 rounded-full hover:bg-blue-600 transition"
            >
               Edit Details
            </button>
              <button
                onClick={() => handlePayment()}
                className=" w-full px-7 py-2 bg-blue-900 text-white border border-blue-600 rounded-full hover:bg-blue-600 transition"
              >
                 Confirm Booking
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
