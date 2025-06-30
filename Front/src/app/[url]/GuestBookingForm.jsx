import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { X } from "lucide-react";
import { postReq, site } from "../_utils/request";
import { useContext, useMemo } from "react";
import QRCode from "react-qr-code";
import PopEffect from "../_components/PopEffect";
import { Context } from "../_components/ContextProvider";
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
  const [showInstructions, setShowInstructions] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [screenshot, setScreenshot] = useState(null);
  useEffect(() => {
    if (!showQR || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showQR, countdown]);
  useEffect(() => {
    if (countdown <= 0 && !screenshot) {
      setShowQR(false);
      setSubmitted(false);
      setBookingConfirmed(false);
      setBookingId("");
      onClose(null);
    }
  }, [countdown, screenshot]);

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

      let total = totalBase + extraCharges + childCharge;
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
          else if (assign === 2) rate = cat.rate2 * 2 || 0;
          else if (assign === 3) rate = cat.rate3 * 3 || 0;
          else if (assign >= 4) rate = cat.rate4 * 4 || 0;

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
      const maxCap = selectedCats.reduce((max, cat) => {
        return Math.max(max, cat.capacity || 0);
      }, 0);

      let rateForChildren = 0;
      for (const cat of selectedCats) {
        if ((cat.capacity || 0) === maxCap) {
          if (maxCap === 1) rateForChildren = cat.rate1 || 0;
          else if (maxCap === 2) rateForChildren = cat.rate2 || 0;
          else if (maxCap === 3) rateForChildren = cat.rate3 || 0;
          else if (maxCap >= 4) rateForChildren = cat.rate4 || 0;
          break;
        }
      }
      const childCharge = age_6_10 * rateForChildren * nights * 0.5;

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
  const hotelSlug =
    typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "";
  const upiId = hosthotel?.url === hotelSlug ? hosthotel?.upi_id : null;
  const upiLink = useMemo(() => {
    return upiId ? upiDeepLink(upiId, advanceAmount) : "";
  }, [upiId, advanceAmount]);
  function upiDeepLink(id, amount, tid = "", notes = "Booking Payment") {
    return `upi://pay?pa=${id}&am=${amount}&cu=INR&tn=${notes}`;
  }

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
      } else {
        console.log(result.message);
      }
    } catch (err) {
      console.error("Booking error:", err);
    }
  };
  const handleScreenshotPayment = async (file) => {
    alert(" screenshot sent successfully booking done ");
    const fd = new FormData();
    fd.append("bid", bookingId);
    fd.append("images", file);

    const res = await fetch(site + "guestbooking/guest/ss", {
      method: "POST",
      body: fd,
    });

    const result = await res.json();
    if (result.success) {
      setBookingConfirmed(true);
      onSave(result.booking);
    } else {
      console.error("Booking error:");
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
                  onWheel={(e) => e.target.blur()}
                  placeholder="Adults"
                  required
                  className="no-spinner w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 ml-1">
                  👶 Children
                </label>
                <input
                  type="number"
                  name="children"
                  onWheel={(e) => e.target.blur()}
                  value={formData.children}
                  onChange={handleChange}
                  placeholder="Children"
                  required
                  className="no-spinner w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
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
                  onWheel={(e) => e.target.blur()}
                  onChange={handleChange}
                  placeholder="0–5 yrs"
                  required
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
                  onWheel={(e) => e.target.blur()}
                  value={formData.age_6_10}
                  onChange={handleChange}
                  placeholder="6–10 yrs"
                  required
                  className="no-spinner w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
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
              <strong>Checkin:</strong> {format(booking.from, "MMM dd")} -{" "}
              <strong>Checkout:</strong>{" "}
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
            {!showInstructions && (
              <button
                onClick={() => setShowInstructions(true)}
                className="w-full max-w-xs bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                💸 Proceed to Payment
              </button>
            )}

            {showInstructions && !showQR && (
              <PopEffect cb={() => setShowInstructions(false)}>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-md space-y-4 mt-4">
                  <h2 className="font-bold text-lg">🕒 Payment Instructions</h2>
                  <ul className="list-decimal ml-5 space-y-1 text-sm text-black">
                    <li>
                      You have <strong>4 minutes</strong> to complete the
                      payment.
                    </li>
                    <li>
                      Pay using the <strong>QR code</strong> or{" "}
                      <strong>UPI button</strong> below.
                    </li>
                    <li>
                      After payment, <strong>upload the screenshot</strong>{" "}
                      immediately.
                    </li>
                    <li>
                      If not uploaded within time,{" "}
                      <span className="text-red-600 font-semibold">
                        your booking will be cancelled.
                      </span>
                    </li>
                  </ul>
                  <div className="text-center">
                    <button
                      onClick={() => {
                        setShowInstructions(false);
                        handlePayment();
                        setShowQR(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      OK, Show Payment Options
                    </button>
                  </div>
                </div>
              </PopEffect>
            )}

            {showQR && (
              <PopEffect cb={() => setShowQR(false)}>
                <div className="space-y-4 mt-4 text-center text-black">
                  <p className="text-lg font-semibold">
                    ⏱ Time Left: {Math.floor(countdown / 60)}:
                    {countdown % 60 < 10 ? "0" : ""}
                    {countdown % 60}
                  </p>
                  <div className="flex justify-center">
                    <QRCode value={upiLink} size={180} />
                  </div>
                  <a
                    href={upiLink}
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                  >
                    Pay via UPI
                  </a>

                  {!screenshot && countdown > 0 ? (
                    <>
                      <p className="mt-4">
                        📤 Upload payment screenshot{" "}
                        <span className="inline-block animate-bounce">👇🏻</span>
                      </p>

                      <input
                        id="fileUpload"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setScreenshot(file);
                          handleScreenshotPayment(file);
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="fileUpload"
                        className="cursor-pointer bg-blue-600 hover:bg-green-700 text-white px-4 py-2 rounded-md mt-2 inline-block text-center"
                      >
                        📸 Choose Screenshot
                      </label>
                    </>
                  ) : countdown <= 0 && !screenshot ? (
                    <p className="text-red-600 font-semibold">
                      ❌ Time's up! Booking cancelled.
                    </p>
                  ) : (
                    <p className="text-green-600 font-bold">
                      ✅ Screenshot received.
                    </p>
                  )}
                </div>
              </PopEffect>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
