"use client";

import { agent } from "../_components/ContextProvider";

type props = {
  info: agent;
  setInfo: React.Dispatch<React.SetStateAction<agent>>;
};

const AgentForm = ({ info, setInfo }: props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === "hname")
      setInfo((p) => ({ ...p, name: e.target.value }));
    if (e.target.id === "hloc")
      setInfo((p) => ({ ...p, location: e.target.value }));
    if (e.target.id === "hupi")
      setInfo((p) => ({ ...p, upi_id: e.target.value }));
    if (e.target.id === "hph1") setInfo((p) => ({ ...p, ph1: e.target.value }));
    if (e.target.id === "hph2") setInfo((p) => ({ ...p, ph2: e.target.value }));
    if (e.target.id === "hagency")
      setInfo((p) => ({ ...p, agency: e.target.value }));
  };

  return (
    <div className="p-5">
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
        <label htmlFor="hnr">Agency name :</label>
        <input
          type="text"
          name=""
          value={info.agency}
          className="pinput"
          id="hagency"
          placeholder="Agency name"
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
        <label htmlFor="hph1"> Whatsapp Number : </label>
        <input
          type="number"
          name="ph1"
          className="pinput"
          value={info.ph1}
          id="hph1"
          placeholder="whatsapp number"
          onChange={handleChange}
        />
        <label htmlFor="hph2">2nd phone Number :</label>
        <input
          type="number"
          name="ph2"
          value={info.ph2 || ""}
          id="hph2"
          className="pinput"
          placeholder="Secondary phone"
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default AgentForm;
