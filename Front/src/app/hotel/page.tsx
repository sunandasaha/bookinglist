"use client";

import { useContext, useEffect, useState } from "react";
import { Context, hostHotel } from "../_components/ContextProvider";
import { useRouter } from "next/navigation";
import HostForm from "./HostForm";
import { postReq, putReq } from "../_utils/request";

const def = {
  name: "",
  location: "",
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
      setHosthotel(res.hotel);
      navigate.push("/calendar");
    }
  };

  useEffect(() => {
    if (user.role !== "host") {
      navigate.push("/");
    }
  }, []);
  return (
    <div className="con">
      <HostForm info={info} setInfo={setInfo} />
      <button className="pbutton" onClick={update}>
        {hosthotel?._id ? "Update" : "Create"}
      </button>
    </div>
  );
};

export default Hotel;
