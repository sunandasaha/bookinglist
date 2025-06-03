import { useState } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";

export default function GuestBookingForm({ selectedBooking, onClose, onSave }) {
  if (!selectedBooking) return null;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    adults: 1,
    children: 0,
    message: `Hi, your booking is confirmed at our hotel. Your Booking ID will be generated after confirmation.`,
  });

  const [errors, setErrors] = useState({ phone: "" });
  const validatePhone = (number) => {
    const cleaned = number.replace(/\D/g, ""); 
    if (cleaned.length !== 10) {
      return "Phone number must contain exactly 10 digits.";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "phone") {
      const phoneError = validatePhone(value);
      setErrors((prev) => ({ ...prev, phone: phoneError }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const phoneError = validatePhone(formData.phone);
    setErrors({ phone: phoneError });

    if (phoneError) {
      return; 
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4 pt-20">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm max-h-[85vh] overflow-auto mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-green-600">Guest Booking</h3>
          <button onClick={() => onClose(null)} aria-label="Close modal">
            <X size={24} style={{ color: "red" }} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 flex flex-col items-center"
        >
          <div className="bg-gray-100 p-3 rounded text-black w-full text-left">
            <p>
              <strong>Dates:</strong> {format(selectedBooking.from, "MMM dd")} -{" "}
              {format(selectedBooking.to, "MMM dd")}
            </p>
            <p>
              <strong>Rooms:</strong> {selectedBooking.roomNames.join(", ")}
            </p>
            <p>
              <strong>Booking ID:</strong> Will be generated on confirmation
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
            placeholder="Address"
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
                errors.phone ? "border-red-500 ring-red-500" : "focus:ring-blue-500"
              }`}
            />

            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="💬WhatsApp Number"
              className="w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {errors.phone && (
            <p className="text-red-600 text-sm mt-1 max-w-xs w-full">{errors.phone}</p>
          )}

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder=" 📧Email"
            className="w-full max-w-xs p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
          />

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <input
              type="number"
              name="adults"
              value={formData.adults}
              onChange={handleChange}
              placeholder="Adults"
              required
              className="w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="children"
              value={formData.children}
              onChange={handleChange}
              placeholder="Children"
              className="w-full p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <textarea
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            className="w-full max-w-xs p-4 border rounded text-black text-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full max-w-xs bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}
