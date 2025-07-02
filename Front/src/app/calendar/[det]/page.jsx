"use client";

import { useRouter } from "next/navigation";
import { Context } from "../../_components/ContextProvider";
import { getReq, putReq } from "../../_utils/request";
import PopEffect from "../../_components/PopEffect";
import React, { useContext, useEffect, useState } from "react";

const CheckDetails = ({ params }) => {
  const [bookings, setBookings] = useState([]);
  const [det, setDet] = useState("");
  const navigate = useRouter();
  const { user } = useContext(Context);
  const [earlyOpen, setEarlyOpen] = useState({});
  const [priceDetails, setPriceDetails] = useState({});

  const getData = async () => {
    const par = (await params).det;
    setDet(par);
    const res = await getReq("guestbooking/chk/" + par, user?.token);
    if (res.success) {
      setBookings(res.bookings);
    } else {
      console.log(res);
    }
  };

  const handleCancel = async (id) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      const res = await putReq(
        "guestbooking/status",
        {
          id,
          can: true,
        },
        user.token
      );
      if (res.success) {
        setBookings((p) => {
          const copy = p.filter((e) => e._id !== id);
          return copy;
        });
      }
    }
  };

  const handleIn = async (id) => {
    if (confirm("Mark this guest as checked in?")) {
      const res = await putReq(
        "guestbooking/stat",
        {
          id,
          status: 11,
        },
        user.token
      );
      if (res.success) {
        setBookings((p) => {
          const copy = p.filter((e) => e._id !== id);
          return copy;
        });
      }
    }
  };
  const handleCheckout = async (id, amo) => {
    if (confirm("Are you sure to mark this guest as checked out?")) {
      const res = await putReq(
        "guestbooking/checkout",
        {
          id,
          amountPaid: amo,
        },
        user.token
      );
      if (res.success) {
        setBookings((p) => {
          const copy = p.filter((e) => e._id !== id);
          return copy;
        });
        alert("Checked out!");
      }
    }
  };

  const updatePriceField = (id, field, value) => {
    setPriceDetails((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const calculateFinal = (b) => {
    const dets = priceDetails[b._id] || {};
    const extra = parseFloat(dets.extra) || 0;
    const discount = parseFloat(dets.discount) || 0;
    const isPercent = dets.isPercent;
    const base = b.totalPrice - b.advanceAmount;

    const discountValue = isPercent ? (discount / 100) * base : discount;
    const final = base + extra - discountValue;

    setPriceDetails((prev) => ({
      ...prev,
      [b._id]: {
        ...prev[b._id],
        finalPrice: Math.max(final, 0).toFixed(2),
        showCheckout: true,
      },
    }));
  };

  useEffect(() => {
    if (user) {
      getData();
    } else {
      navigate.push("/");
    }
  }, []);

  return (
     <PopEffect cb = {()=> navigate.back() } >
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold capitalize">
        {det === "checkin"
          ? "Today's Check-ins"
          : det === "checkout"
          ? "Today's Check-outs"
          : "Today's Staying Guests"}
      </h2>

      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings found for today.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="border rounded p-4 shadow-sm bg-gray-50 space-y-2"
            >
              <div className="font-semibold text-lg">{b.name}</div>
              <div className="text-sm text-gray-700">
                💬 whatsapp {b.whatsapp}
              </div>
              <div className="text-sm text-gray-700">
                {" "}
                💰 balance : { b.totalPrice - b.advanceAmount}
              </div>
              <div className="text-sm text-gray-700">
                🛏️ Rooms: {b.rooms?.join(", ")}
              </div>
              {det === "checkin" && (
                <div className="flex gap-4 mt-2">
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    onClick={() => handleCancel(b._id)}
                  >
                    Didn't Arrive
                  </button>
                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    onClick={() => handleIn(b._id)}
                  >
                    Check-in
                  </button>
                </div>
              )}

              {(det === "checkout" || (det === "tb" && earlyOpen[b._id])) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="text-sm">Extra (₹):</label>
                    <input
                      type="number"
                      className="border px-2 py-1 rounded w-24"
                      placeholder="0"
                      value={priceDetails[b._id]?.extra || ""}
                      onChange={(e) =>
                        updatePriceField(b._id, "extra", e.target.value)
                      }
                    />
                  </div>
                  <div  className="flex items-center gap-2 flex-wrap">
                    <label className="text-sm">Discount:</label>
                    <input
                      type="number"
                      className="border px-2 py-1 rounded w-24"
                      placeholder="0"
                      value={priceDetails[b._id]?.discount || ""}
                      onChange={(e) =>
                        updatePriceField(b._id, "discount", e.target.value)
                      }
                    />
                    <select
                      className="border px-2 py-1 rounded"
                      value={
                        priceDetails[b._id]?.isPercent ? "percent" : "rupee"
                      }
                      onChange={(e) =>
                        updatePriceField(
                          b._id,
                          "isPercent",
                          e.target.value === "percent"
                        )
                      }
                    >
                      <option value="rupee">₹</option>
                      <option value="percent">%</option>
                    </select>
                    <button
                      onClick={() => calculateFinal(b)}
                      className="ml-2 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Final Price
                    </button>
                  </div>
                  {priceDetails[b._id]?.finalPrice && (
                    <div className="text-sm font-semibold text-indigo-600">
                      Total Amount: ₹{priceDetails[b._id].finalPrice}
                    </div>
                  )}
                  {priceDetails[b._id]?.showCheckout && (
                    <button
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() =>
                        handleCheckout(b._id, priceDetails[b._id].finalPrice)
                      }
                    >
                      Checkout
                    </button>
                  )}
                </div>
              )}

              {det === "tb" && !earlyOpen[b._id] && (
                <button
                  className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() =>
                    setEarlyOpen((prev) => ({ ...prev, [b._id]: true }))
                  }
                >
                  Early Checkout
                </button>
              )}
            </div>
          ))}
        </div>
        
      )}
     
    </div>
    </PopEffect>
  
  );
  
};

export default CheckDetails;
 
