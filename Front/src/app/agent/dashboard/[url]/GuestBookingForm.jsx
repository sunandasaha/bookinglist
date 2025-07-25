import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { X, Baby, User,Upload, Camera } from "lucide-react";
import { postReq, site } from "../../../_utils/request";
import { useContext, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";
import PopEffect from "../../../_components/PopEffect";
import { Context } from "../../../_components/ContextProvider";
export default function GuestBookingForm({ booking, onSave, onClose }) {
  if (!booking) return null;
  const { user, hosthotel } = useContext(Context);
  const [copiedAmount, setCopiedAmount] = useState(false);

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
   message: "Thank you for booking! Your Booking ID will be generated after payment. A confirmation email will follow once your booking is approved by the host.",

  });

  const [errors, setErrors] = useState({ phone: "", whatsapp: "" });
  const [submitted, setSubmitted] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [screenshot, setScreenshot] = useState(null);
  const [copied, setCopied] = useState(false);

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
  const { totalPrice, advanceAmount, agentCut, ActualPay, error } = useMemo(() => {
  if (
    !hosthotel ||
    !booking?.roomNames?.length ||
    !booking.from ||
    !booking.to
  ) {
    return {
      totalPrice: 0,
      advanceAmount: 0,
      agentCut: 0,
      ActualPay: 0,
    };
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
    return {
      totalPrice: 0,
      advanceAmount: 0,
      agentCut: 0,
      ActualPay: 0,
    };
  }
  let agentCut = 0;
  // PER ROOM PRICING
  if (hosthotel?.pay_per?.room) {
    const selectedCats =
      hosthotel.room_cat?.filter((cat) =>
        cat.room_no?.some((room) => selectedRooms.includes(room))
      ) || [];
    if (!selectedCats.length)
      return {
        totalPrice: 0,
        advanceAmount: 0,
        agentCut: 0,
        ActualPay: 0,
      };
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
      const roomTotal = rate * roomCount * nights;
      const commission = cat.agent_com
        ? cat.agent_com.percent
          ? roomTotal * (cat.agent_com.amount / 100)
          : (cat.agent_com.amount || 0) * roomCount * nights
        : 0;
      agentCut += commission;
      const netRoomTotal = roomTotal - commission;
      if (cat.advance?.percent) {
        totalAdvance += netRoomTotal * (cat.advance.amount / 100);
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
        agent_com: cat.agent_com,
      });
    });
    if (adults > totalMaxCapacity) {
      return {
        error: `Only ${totalMaxCapacity} adult(s) can be accommodated. ${adults - totalMaxCapacity} extra adult(s) cannot be accommodated.`,
        totalPrice: 0,
        advanceAmount: 0,
        agentCut: 0,
        ActualPay: 0,
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
    if (childRateRoom?.advance?.percent) {
      const childCommission = childRateRoom.agent_com
        ? childCharge * (childRateRoom.agent_com.amount / 100)
        : 0;
      totalAdvance +=
        (childCharge - childCommission) *
        (childRateRoom.advance.amount / 100);
    }
    const totalPrice = totalBase + extraCharges + childCharge;
    const ActualPay = totalPrice - agentCut;
    return {
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      advanceAmount: parseFloat(totalAdvance.toFixed(2)),
      agentCut: parseFloat(agentCut.toFixed(2)),
      ActualPay: parseFloat(ActualPay.toFixed(2)),
    };
  }
  // PER PERSON PRICING
  if (hosthotel?.pay_per?.person) {
    const selectedCats =
      hosthotel.per_person_cat?.filter((cat) =>
        cat.roomNumbers?.some((room) => selectedRooms.includes(room))
      ) || [];

    if (!selectedCats.length) {
      return {
        totalPrice: 0,
        advanceAmount: 0,
        agentCut: 0,
        ActualPay: 0,
      };
    }
    const roomStats = selectedRooms
      .map((roomNo) => {
        const cat = selectedCats.find((c) =>
          c.roomNumbers.includes(roomNo)
        );
        if (!cat) return null;
        const capacity = cat.capacity || 1;
        return {
          roomNo,
          cat,
          assigned: 0,
          baseCap: capacity,
          maxCap: 4,
        };
      })
      .filter(Boolean);
    let remaining = adults;
    roomStats.forEach((room) => {
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
    }
    let totalBase = 0;
    let totalAdvance = 0;
    agentCut = 0;
    const rateDetails = [];
    for (const room of roomStats) {
      const { assigned, cat } = room;
      if (assigned < 1 || assigned > 4) continue;
      const rate = cat[`rate${assigned}`] || 0;
      const roomTotal = rate * assigned * nights;
      totalBase += roomTotal;
      const percent = cat.agentCommission?.percent ?? true;
      const amount = cat.agentCommission?.amount ?? 0;
      const commission = percent
        ? roomTotal * (amount / 100)
        : amount * nights;
      agentCut += commission;
      const netRoomTotal = roomTotal - commission;
      const advPercent = cat.advance?.percent ?? true;
      const advAmount = cat.advance?.amount ?? 0;
      if (advPercent) {
        totalAdvance += netRoomTotal * (advAmount / 100);
      } else {
        totalAdvance += advAmount * nights;
      }
      rateDetails.push({ rate, cat });
    }
    if (age_6_10 > 0 && rateDetails.length > 0) {
      const minDetail = rateDetails.reduce(
        (min, curr) => (curr.rate < min.rate ? curr : min),
        { rate: Infinity }
      );
      const childCharge = age_6_10 * minDetail.rate * nights * 0.5;
      totalBase += childCharge;
      const childPercent = minDetail.cat.agentCommission?.percent ?? true;
      const childAmount = minDetail.cat.agentCommission?.amount ?? 0;
      const childCommission = childPercent
        ? childCharge * (childAmount / 100)
        : childAmount * nights;
      agentCut += childCommission;
      const netChild = childCharge - childCommission;
      const childAdvPercent = minDetail.cat.advance?.percent ?? true;
      const childAdvAmount = minDetail.cat.advance?.amount ?? 0;
      if (childAdvPercent) {
        totalAdvance += netChild * (childAdvAmount / 100);
      } else {
        totalAdvance += childAdvAmount * nights;
      }
    }
    const ActualPay = totalBase - agentCut;
    return {
      totalPrice: parseFloat(totalBase.toFixed(2)),
      advanceAmount: parseFloat(totalAdvance.toFixed(2)),
      agentCut: parseFloat(agentCut.toFixed(2)),
      ActualPay: parseFloat(ActualPay.toFixed(2)),
    };
  }
  return {
    totalPrice: 0,
    advanceAmount: 0,
    agentCut: 0,
    ActualPay: 0,
  };
}, [
  hosthotel,
  booking,
  formData.adults,
  formData.children,
  formData.age_0_5,
  formData.age_6_10,
]);
  const hotelSlug =
    typeof window !== "undefined" ? window.location.pathname.split("/")[3] : "";
  const upiId = hosthotel?.url === hotelSlug ? hosthotel?.upi_id : null;
  const upiLink = useMemo(() => {
    return upiId
      ? buildUpiUri({
          pa: upiId,
          am: advanceAmount,
          tr: bookingId || "booking list",
          pn: "booking list",
        })
      : "";
  }, [upiId, advanceAmount]);
  function buildUpiUri({
    pa,
    pn = "",
    tr = "",
    tn = "",
    am,
    mc = "",
    cu = "INR",
  }) {
    const params = new URLSearchParams({
      pa,
      pn,
      tr,
      tn,
      am: am.toString(),
      cu,
    });
    if (mc) params.set("mc", mc);
    return `upi://pay?${params.toString()}`;
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
      agentCut,
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
        setShowQR(true);
      } else {
        alert(
          "❌ Failed to save booking: " + (result.message || "Unknown error")
        );
        console.log(result.message);
      }
    } catch (err) {
      console.error("Booking error:", err);
    }
  };
  const handleScreenshotPayment = async (file) => {
    alert(
      `✅ Screenshot received.🎉 Booking done!\n🆔 ID: ${bookingId}\n📧 You'll get an email once the hotel confirms.`
    );
    setShowQR(false);
    onClose(null);
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
    setScreenshot(file);
  } else {
    console.error("Booking error:");
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
                            <strong className="text-blue-900">Email:</strong> {formData.email}
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
              <p>
              <strong className="text-blue-900">Agent Commission:</strong> ₹
              {agentCut? agentCut.toFixed(2): 0}
            </p>
            <p>
              <strong className="text-blue-900">Agent Pay:</strong> ₹
              {ActualPay? ActualPay.toFixed(2): 0}
            </p>
              <button
              onClick={() => setIsEditing(true)}
              className="w-full px-7 py-2 bg-white-900 text-black border border-blue-600 rounded-full hover:bg-blue-600 transition"
            >
               Edit Details
            </button>
            {!showInstructions && (
              <button
                onClick={() => setShowInstructions(true)}
                className=" w-full px-7 py-2 bg-blue-900 text-white border border-blue-600 rounded-full hover:bg-blue-600 transition"
              >
                 Proceed to Payment
              </button>
            )}
            {showInstructions && !showQR && (
                <PopEffect cb={() => setShowInstructions(false)}>
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-md space-y-4 mt-4">
                    <h2 className="font-bold text-lg">🕒 Payment Instructions</h2>
                    <ul className="list-decimal ml-5 space-y-1 text-sm text-black">
                       <li>
                      You have <strong>5 minutes</strong> to complete the booking.
                    </li>
                    <li>
                      <strong>Scan the QR code</strong> from phone in any UPI app.
                    </li>
                    <li>
                      After  payment, <strong>upload the screenshot immediately</strong>.
                    </li>
                    <li>
                      If the screenshot is not uploaded within 5 minutes,{" "}
                      <span className="text-red-600 font-semibold">your booking will be cancelled.</span>
                    </li>
                    <li>
                      Advance goes to hotel, you’ll<strong>get email </strong> once they accept.
                    </li>
                    </ul>

                    <div className="text-center">
                      <button
                      onClick={() => {
                        setShowInstructions(false);
                        handlePayment();
                      }}
                      className="px-7 py-2 bg-blue-900 text-white border border-blue-600 rounded-full hover:bg-blue-600 transition"
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
                  {/* Countdown Timer */}
                  <p className="text-lg font-bold text-blue-900">
                    ⏱ Time Left: {Math.floor(countdown / 60)}:
                    {countdown % 60 < 10 ? "0" : ""}
                    {countdown % 60}
                  </p>
                  {/* Conditional Instruction Message */}
                  <div className="mt-2 text-sm font-medium">
                    {advanceAmount <= 2000 ? (
                      <p>Download and scan the QR from gallery.</p>
                    ) : (
                      <p>
                        📱 Scan QR from another phone.
                      </p>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <div id="qr-container" className="bg-white p-2 rounded">
                      <QRCodeCanvas value={upiLink} size={180} />
                    </div>
                  </div>
                  {!screenshot && countdown > 0 ? (
                    <>
                      <p className="flex items-center gap-2 mt-4 justify-center">
                         Upload payment screenshot{" "}
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
                        className="flex items-center gap-2 cursor-pointer px-7 py-2 bg-blue-900 text-white border border-blue-600 rounded-full hover:bg-blue-600 transition justify-center"
                      >
                        <Camera size={20}  />  Choose Screenshot
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
