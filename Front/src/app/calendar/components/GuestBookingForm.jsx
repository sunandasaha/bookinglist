import { useState } from "react";
import { format } from "date-fns";
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
    message: `Hi, your booking is confirmed at our hotel. Your Booking ID will be generated after confirmation.`,
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
    if (!hosthotel || !booking?.roomNames?.length)
      return { totalPrice: 0, advanceAmount: 0 };

    const selected = booking.roomNames;
    let total = 0;
    let advance = 0;

    if (hosthotel.pay_per.room && hosthotel.room_cat) {
      for (const cat of hosthotel.room_cat) {
        for (const room of cat.room_no) {
          if (selected.includes(room)) {
            total += cat.price;
            advance += cat.advance.percent
              ? (cat.advance.amount / 100) * cat.price
              : cat.advance.amount;
          }
        }
      }
    }

    if (hosthotel.pay_per.person && hosthotel.per_person_cat) {
      for (const cat of hosthotel.per_person_cat) {
        for (const room of cat.roomNumbers) {
          if (selected.includes(room)) {
            const rate = cat.rate1;
            total += rate;
            advance += cat.advance?.percent
              ? (cat.advance.amount / 100) * rate
              : cat.advance?.amount || 0;
          }
        }
      }
    }

    return {
      totalPrice: total,
      advanceAmount: advance,
    };
  }, [hosthotel, booking]);

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
                <strong>Dates:</strong> {format(booking.from, "MMM dd")} -{" "}
                {format(booking.to, "MMM dd")}
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
              <strong>Dates:</strong> {format(booking.from, "MMM dd")} -{" "}
              {format(booking.to, "MMM dd")}
            </p>
            <p>
              <strong>Rooms:</strong> {booking.roomNames.join(", ")}
            </p>
            <p>
              <strong>Message:</strong> {formData.message}
            </p>
            <p>
              <strong>Total Price:</strong> ₹{totalPrice.toFixed(2)}
            </p>
            <p>
              <strong>Advance to Pay:</strong> ₹{advanceAmount.toFixed(2)}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full max-w-xs bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition"
            >
              ✏️ Edit Details
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
