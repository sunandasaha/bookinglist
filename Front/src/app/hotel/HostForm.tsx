"use client";

import { hostHotel } from "../_components/ContextProvider";

type props = {
  info: hostHotel;
  setInfo: React.Dispatch<React.SetStateAction<hostHotel>>;
};

const HostForm = ({ info, setInfo }: props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === "hname")
      setInfo((p) => ({ ...p, name: e.target.value }));
    if (e.target.id === "hloc")
      setInfo((p) => ({ ...p, location: e.target.value }));
    if (e.target.id === "hupi")
      setInfo((p) => ({ ...p, upi_id: e.target.value }));
    if (e.target.id === "hph1") setInfo((p) => ({ ...p, ph1: e.target.value }));
    if (e.target.id === "hph2") setInfo((p) => ({ ...p, ph2: e.target.value }));
    if (e.target.id === "hnr")
      setInfo((p) => ({ ...p, rooms: Number(e.target.value) }));
  };

  return (
    <div className="con">
      <div className="grid2">
        <label htmlFor="hname"> Name : </label>
        <input
          type="text"
          name="name"
          id="hname"
          value={info.name}
          placeholder="Name"
          onChange={handleChange}
        />
        <label htmlFor="hloc"> Location : </label>
        <input
          type="text"
          name="Location"
          value={info.location}
          id="hloc"
          placeholder="Location"
          onChange={handleChange}
        />
        <label htmlFor="hupi"> UPI ID : </label>
        <input
          type="text"
          name="UPI"
          value={info.upi_id}
          id="hupi"
          placeholder="UPI ID"
          onChange={handleChange}
        />
        <label htmlFor="hph1"> Phone Number : </label>
        <input
          type="number"
          name="ph1"
          value={info.ph1}
          id="hph1"
          placeholder="primary phone"
          onChange={handleChange}
        />
        <label htmlFor="hph2"></label>
        <input
          type="number"
          name="ph2"
          value={info.ph2 || ""}
          id="hph2"
          placeholder="Secondary phone"
          onChange={handleChange}
        />
        <label htmlFor="hnr">Number of rooms :</label>
        <input
          type="number"
          name="ph2"
          value={info.rooms}
          id="hnr"
          placeholder="Number of rooms"
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default HostForm;
