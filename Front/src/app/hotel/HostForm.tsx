"use client";
import { useRouter } from "next/navigation";
import { hostHotel } from "../_components/ContextProvider";
import {ArrowLeft,Building2,MapPin,User,IndianRupee,Phone, MessageCircle, BedDouble,UserRound,Users,} from "lucide-react";
type props = {
  info: hostHotel;
  setInfo: React.Dispatch<React.SetStateAction<hostHotel>>;
};
const HostForm = ({ info, setInfo }: props) => {
  const navigate = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    switch (e.target.id) {
      case "hname": setInfo(p => ({ ...p, name: val })); break;
      case "hloc": setInfo(p => ({ ...p, location: val })); break;
      case "hacc": setInfo(p => ({ ...p, accountName: val })); break;
      case "hupi": setInfo(p => ({ ...p, upi_id: val })); break;
      case "hph1": setInfo(p => ({ ...p, ph1: val })); break;
      case "hph2": setInfo(p => ({ ...p, ph2: val })); break;
      case "hnr": setInfo(p => ({ ...p, rooms: Number(val) })); break;
    }
  };
  const handleRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "person";
    setInfo((p) => ({ ...p, pay_per: { person: val, room: !val } }));
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-lg bg-white p-6 md:p-10 rounded-2xl shadow-lg">
        <button
          onClick={() => navigate.back()}
          className="mb-6 flex items-center gap-2 text-black hover:text-indigo-800 transition"
        >
          <ArrowLeft size={22} /> 
        </button>
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
            />
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-indigo-900" />
            <input
              id="hloc"
              type="text"
              placeholder="Location"
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
              value={info.ph1}
              onChange={handleChange}
              className="flex-1 pinput"
            />
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-indigo-900" />
            <input
              id="hph2"
              type="number"
              placeholder="Second Phone (optional)"
              value={info.ph2 || ""}
              onChange={handleChange}
              className="flex-1 pinput"
            />
          </div>
          <div className="flex items-center gap-3">
            <BedDouble className="text-indigo-900" />
            <input
              id="hnr"
              type="number"
              placeholder="Number of Rooms"
              value={info.rooms===0? "" : info.rooms}
              onChange={handleChange}
              className="flex-1 pinput"
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
      </div>
    </div>
  );
};

export default HostForm;
