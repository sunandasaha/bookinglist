import { useState } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { postReq, getReq } from "../../../_utils/request";
import { useContext, useMemo } from "react";
import { Context } from "../../../_components/ContextProvider";
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
    message:
      "Hi, your booking is confirmed at our hotel. Your Booking ID will be generated after confirmation.,",
  });

  const [errors, setErrors] = useState({ phone: "", whatsapp: "" });
  const [submitted, setSubmitted] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState("");

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
    const phoneError = validatePhone(formData.phone);
    const whatsappError = validatePhone(formData.whatsapp);
    setErrors({ phone: phoneError, whatsapp: whatsappError });

    if (!phoneError && !whatsappError) {
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

    //  PER ROOM PRICING
    if (hosthotel?.pay_per?.room) {
      const selectedCats =
        hosthotel.room_cat?.filter((cat) =>
          cat.room_no?.some((room) => selectedRooms.includes(room))
        ) || [];

      if (selectedCats.length === 0) {
        return { totalPrice: 0, advanceAmount: 0 };
      }

      let totalBase = 0;
      let totalAdvance = 0;
      let totalCapacity = 0;
      const allPerAdultRates = [];
      const allExtraPrices = [];

      for (const cat of selectedCats) {
        const roomCount = cat.room_no.filter((r) =>
          selectedRooms.includes(r)
        ).length;
        if (roomCount === 0) continue;

        const capacity = cat.capacity || 0;
        const rate = cat.price || 0;
        const extra = cat.price_for_extra_person || 0;

        totalCapacity += capacity * roomCount;
        totalBase += rate * roomCount * nights;
        allPerAdultRates.push(rate / capacity);
        allExtraPrices.push(extra);

        totalAdvance += cat.advance?.percent
          ? (cat.advance.amount / 100) * cat.price * nights * roomCount
          : (cat.advance.amount || 0) * nights * roomCount;
      }

      const extraAdults = Math.max(0, adults - totalCapacity);
      const minExtraPrice =
        allExtraPrices.length > 0 ? Math.min(...allExtraPrices) : 0;
      const extraCharges = extraAdults * minExtraPrice * nights;

      const minPerAdultRate =
        allPerAdultRates.length > 0 ? Math.min(...allPerAdultRates) : 0;
      const childCharge = age_6_10 * 0.5 * minPerAdultRate * nights;

      const total = totalBase + extraCharges + childCharge;
      return {
        totalPrice: parseFloat(total.toFixed(2)),
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
      let totalBase = 0;
      let totalAdvance = 0;
      const allRate1s = [];
      let remainingAdults = adults;
      const roomPlan = [];
      for (const cat of selectedCats) {
        const matchedRooms = cat.roomNumbers.filter((r) =>
          selectedRooms.includes(r)
        );
        const roomCount = matchedRooms.length;
        const capacity = cat.capacity || 0;
        allRate1s.push(cat.rate1 || 0);

        for (let i = 0; i < roomCount && remainingAdults > 0; i++) {
          const assign = Math.min(remainingAdults, capacity);
          remainingAdults -= assign;
          let rate = 0;
          if (assign === 1) rate = cat.rate1 || 0;
          else if (assign === 2) rate = cat.rate2 || 0;
          else if (assign === 3) rate = cat.rate3 || 0;
          else if (assign >= 4) rate = cat.rate4 || 0;

          totalBase += rate * nights;
          if (assign <= capacity) {
            if (cat.advance?.percent) {
              totalAdvance += (cat.advance.amount / 100) * rate * nights;
            } else {
              totalAdvance += (cat.advance?.amount || 0) * nights;
            }
          }

          roomPlan.push({ cat, assigned: assign, extra: 0 });
        }
      }
      if (remainingAdults > 0) {
        for (const plan of roomPlan) {
          const cat = plan.cat;
          const baseCap = cat.capacity || 0;
          const extremeCap = baseCap < 4 ? baseCap + 1 : baseCap;
          const canAdd = extremeCap - plan.assigned;

          if (canAdd > 0 && remainingAdults > 0) {
            const extra = Math.min(remainingAdults, canAdd);
            remainingAdults -= extra;
            totalBase += extra * (cat.rate1 || 0) * nights;
            plan.extra += extra;
          }
          if (remainingAdults === 0) break;
        }
      }
      if (remainingAdults > 0) {
        const maxAdults = roomPlan.reduce((sum, r) => {
          const cap = r.cat.capacity || 0;
          const max = cap < 4 ? cap + 1 : cap;
          return sum + max;
        }, 0);
        return {
          error: `Only ${
            adults - remainingAdults
          } adult(s) can be accommodated. Max capacity is ${maxAdults}.`,
          totalPrice: 0,
          advanceAmount: 0,
        };
      }
      const minRate1 = allRate1s.length > 0 ? Math.min(...allRate1s) : 0;
      const childCharge = age_6_10 * 0.5 * minRate1 * nights;

      return {
        totalPrice: parseFloat((totalBase + childCharge).toFixed(2)),
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
      advanceAmount,
    };

    try {
      const result = await postReq(
        user ? "guestbooking/agent" : "guestbooking/guest",
        bookingPayload,
        user?.token || ""
      );
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
                <strong>From:</strong> {format(booking.from, "MMM dd")} -{" "}
                <strong>To:</strong> {format(booking.to, "MMM dd")}
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
              placeholder="👤Guest Name"
              required
              className="w-full max-w-xs p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="🏠Address"
              required
              className="w-full max-w-xs p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder=" 📞Phone Number"
                required
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
                placeholder="💬WhatsApp Number"
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

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" 📧Email"
              required
              className="w-full max-w-xs p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              <div>
                <label className="text-sm text-gray-600 ml-1">👨 Adults</label>
                <input
                  type="number"
                  name="adults"
                  value={formData.adults}
                  onChange={handleChange}
                  placeholder="Adults"
                  required
                  className="w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 ml-1">
                  👶 Children
                </label>
                <input
                  type="number"
                  name="children"
                  value={formData.children}
                  onChange={handleChange}
                  placeholder="Children"
                  required
                  className="w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              <div>
                <label className="text-sm text-gray-600 ml-1">🧒 Age 0–5</label>
                <input
                  type="number"
                  name="age_0_5"
                  value={formData.age_0_5}
                  onChange={handleChange}
                  placeholder="0–5 yrs"
                  required
                  className="w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 ml-1">
                  👦 Age 6–10
                </label>
                <input
                  type="number"
                  name="age_6_10"
                  value={formData.age_6_10}
                  onChange={handleChange}
                  placeholder="6–10 yrs"
                  required
                  className="w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <textarea
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
            <p>
              <strong>Phone:</strong> {formData.phone}
            </p>
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
              <strong>From</strong> {format(booking.from, "MMM dd")} -{" "}
              <strong>To</strong> {format(booking.from, "MMM dd")}
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
            <p>
              <strong>Advance to Pay:</strong> ₹
              {advanceAmount ? advanceAmount.toFixed(2) : 0}
            </p>

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
              💸 Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
