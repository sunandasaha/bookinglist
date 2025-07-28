"use client";

import { useContext, useEffect, useState } from "react";
import { Context, hostHotel } from "../_components/ContextProvider";
import { useRouter } from "next/navigation";
import { postReq, putReq } from "../_utils/request";
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  IndianRupee,
  Phone,
  MessageCircle,
  BedDouble,
  UserRound,
  Users,
} from "lucide-react";
const def = {
  name: "",
  location: "",
  accountName: "",
  upi_id: "",
  ph1: "",
  rooms: 5,
  pay_per: { person: false, room: true },
};

const Hotel = () => {
  const { user, hosthotel, setHosthotel } = useContext(Context);
  const navigate = useRouter();
  const [info, setInfo] = useState<hostHotel>(hosthotel || def);

  const update = async () => {
    let res;
    if (hosthotel?._id) {
      res = await putReq("hotel/", info, user.token);
    } else {
      res = await postReq("hotel/", info, user.token);
    }
    if (res.status === "success") {
      if (user?.status === 1) {
        setHosthotel(res.hotel);
        navigate.push("/calendar");
      } else {
        navigate.push("/status");
      }
    } else {
      console.log(res);
    }
  };

  useEffect(() => {
    if (user?.role !== "host") {
      navigate.push("/");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    switch (e.target.id) {
      case "hname":
        setInfo((p) => ({ ...p, name: val }));
        break;
      case "hloc":
        setInfo((p) => ({ ...p, location: val }));
        break;
      case "hacc":
        setInfo((p) => ({ ...p, accountName: val }));
        break;
      case "hupi":
        setInfo((p) => ({ ...p, upi_id: val }));
        break;
      case "hph1":
        setInfo((p) => ({ ...p, ph1: val }));
        break;
      case "hph2":
        setInfo((p) => ({ ...p, ph2: val }));
        break;
      case "hnr":
        setInfo((p) => ({ ...p, rooms: Number(val) }));
        break;
    }
  };

  const handleRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "person";
    setInfo((p) => ({ ...p, pay_per: { person: val, room: !val } }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-2xl border border-gray-300 rounded-xl shadow-md bg-white p-6">
        <button
          onClick={() => {
            if (user?.status === 0) {
              navigate.push("/role");
            } else {
              navigate.back();
            }
          }}
          className="mb-6 flex items-center gap-2 text-black hover:text-indigo-800 transition"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-3xl font-semibold text-blue-900 text-center  mb-4">
          🏨 Hotel Profile
        </h2>
        <div className="w-full max-w-lg bg-white p-6 md:p-10 rounded-2xl shadow-xl mx-auto">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Building2 className="text-indigo-900" />
              <input
                id="hname"
                type="text"
                placeholder="Hotel Name"
                value={info.name}
                onChange={handleChange}
                className="flex-1 pinput"
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-indigo-900" />
              <input
                id="hloc"
                type="text"
                placeholder="Location"
                required
                value={info.location}
                onChange={handleChange}
                className="flex-1 pinput"
              />
            </div>
            <div className="flex items-center gap-3">
              <User className="text-indigo-900" />
              <input
                id="hacc"
                type="text"
                placeholder="Account Holder Name"
                required
                value={info.accountName}
                onChange={handleChange}
                className="flex-1 pinput"
              />
            </div>
            <div className="flex items-center gap-3">
              <IndianRupee className="text-indigo-900" />
              <input
                id="hupi"
                type="text"
                placeholder="UPI ID"
                required
                value={info.upi_id}
                onChange={handleChange}
                className="flex-1 pinput"
              />
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle className="text-indigo-900" />
              <input
                id="hph1"
                type="number"
                placeholder="WhatsApp Number"
                required
                value={info.ph1}
                onChange={handleChange}
                className="no-spinner flex-1 pinput"
              />
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-indigo-900" />
              <input
                id="hph2"
                type="number"
                placeholder="Second Phone (optional)"
                required
                value={info.ph2 || ""}
                onChange={handleChange}
                className="no-spinner flex-1 pinput"
              />
            </div>
            <div className="flex items-center gap-3">
              <BedDouble className="text-indigo-900" />
              <input
                id="hnr"
                type="number"
                placeholder="Number of Rooms"
                value={info.rooms === 0 ? "" : info.rooms}
                onChange={handleChange}
                className="no-spinner flex-1 pinput"
              />
            </div>
            <div className="flex items-center justify-start gap-6 mt-4 px-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="pp"
                  value="person"
                  checked={info.pay_per.person}
                  onChange={handleRChange}
                  className="accent-indigo-600"
                />
                <UserRound className="text-indigo-900" size={18} /> Per Person
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="pp"
                  value="room"
                  checked={info.pay_per.room}
                  onChange={handleRChange}
                  className="accent-indigo-600"
                />
                <Users className="text-indigo-900" size={18} /> Per Room
              </label>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button
              className="bg-blue-900 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition duration-300"
              onClick={update}
            >
              {hosthotel?._id ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hotel;
