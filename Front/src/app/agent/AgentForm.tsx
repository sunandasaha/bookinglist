import { agent } from "../_components/ContextProvider";
import { Building2, MapPin, User, IndianRupee, MessageCircle, Phone } from "lucide-react";

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
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <User className="text-indigo-900" />
        <input
          type="text"
          className="flex-1 pinput"
          id="hname"
          value={info.name}
          placeholder="Name"
          onChange={handleChange}
        />
      </div>
      <div className="flex items-center gap-3">
        <Building2 className="text-indigo-900" />
        <input
          type="text"
          className="flex-1 pinput"
          id="hagency"
          value={info.agency}
          placeholder="Agency Name"
          onChange={handleChange}
        />
      </div>
      <div className="flex items-center gap-3">
        <MapPin className="text-indigo-900" />
        <input
          type="text"
          className="flex-1 pinput"
          id="hloc"
          value={info.location}
          placeholder="Location"
          onChange={handleChange}
        />
      </div>
      <div className="flex items-center gap-3">
        <IndianRupee className="text-indigo-900" />
        <input
          type="text"
          className="flex-1 pinput"
          id="hupi"
          value={info.upi_id}
          placeholder="UPI ID"
          onChange={handleChange}
        />
      </div>
      <div className="flex items-center gap-3">
        <MessageCircle className="text-indigo-900" />
        <input
          type="number"
          className="flex-1 pinput"
          id="hph1"
          value={info.ph1}
          placeholder="WhatsApp Number"
          onChange={handleChange}
        />
      </div>
      <div className="flex items-center gap-3">
        <Phone className="text-indigo-900" />
        <input
          type="number"
          className="flex-1 pinput"
          id="hph2"
          value={info.ph2 || ""}
          placeholder="Second Phone Number"
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default AgentForm;
