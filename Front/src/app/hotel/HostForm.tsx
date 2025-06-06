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

  const handleRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "person";
    setInfo((p) => ({ ...p, pay_per: { person: val, room: !val } }));
  };

  return (
    <div className="p-15">
      <div className="grid2">
        <label htmlFor="hname"> Name : </label>
        <input
          type="text"
          className="pinput"
          name="name"
          id="hname"
          value={info.name}
          placeholder="Name"
          onChange={handleChange}
        />
        <label htmlFor="hloc"> Location : </label>
        <input
          type="text"
          className="pinput"
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
          className="pinput"
          value={info.upi_id}
          id="hupi"
          placeholder="UPI ID"
          onChange={handleChange}
        />
        <label htmlFor="hph1"> Phone Number : </label>
        <input
          type="number"
          name="ph1"
          className="pinput"
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
          className="pinput"
          placeholder="Secondary phone"
          onChange={handleChange}
        />
        <label htmlFor="hnr">Number of rooms :</label>
        <input
          type="number"
          name="ph2"
          value={info.rooms}
          className="pinput"
          id="hnr"
          placeholder="Number of rooms"
          onChange={handleChange}
        />
        <label htmlFor="">Pay per</label>
        <div className="px-10">
          <div className="inline">
            <input
              type="radio"
              name="pp"
              id="ppp"
              checked={info.pay_per.person}
              value="person"
              onChange={handleRChange}
            />
            <label htmlFor="ppp">Person</label>
          </div>
          <div className="inline">
            <input
              type="radio"
              name="pp"
              id="ppr"
              value="room"
              checked={info.pay_per.room}
              onChange={handleRChange}
            />
            <label htmlFor="ppr">Room</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostForm;
