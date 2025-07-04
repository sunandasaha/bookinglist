"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { agent, Context } from "../_components/ContextProvider";
import { useRouter } from "next/navigation";
import { putReq, site } from "../_utils/request";
import AgentForm from "./AgentForm";
import Image from "next/image";

const def: agent = {
  name: "",
  location: "",
  upi_id: "",
  ph1: "",
  agency: "",
  hotel_per: [],
};

const Hotel = () => {
  const { user, agent, setAgent } = useContext(Context);
  const navigate = useRouter();
  const [info, setInfo] = useState<agent>(agent || def);
  const imgref = useRef<HTMLInputElement>(null);

  const update = async () => {
    let res;
    if (agent?._id) {
      res = await putReq("agent/", info, user.token);
    } else {
      const fd = new FormData();
      fd.append("details", JSON.stringify(info));
      fd.append("images", imgref.current.files[0]);

      const result = await fetch(site + "agent/", {
        method: "POST",
        headers: { authorization: user.token },
        body: fd,
      });
      res = await result.json();
    }
    if (res.status === "success") {
      if (user.status === 1) {
        setAgent(res.agent);
        navigate.push("/agent/dashboard");
      } else {
        navigate.push("/status");
      }
    } else {
      console.log(res);
    }
  };

  useEffect(() => {
    if (user.role !== "agent") {
      navigate.push("/");
    }
  }, []);
  return (
    <div className="con">
      <AgentForm setInfo={setInfo} info={info} />
      {info._id ? (
        <>
          {info.visiting_card && (
            <img
              style={{ height: 100, width: 150 }}
              src={site + "imgs/" + info.visiting_card}
              alt=""
            />
          )}
        </>
      ) : (
        <label htmlFor="vis-card">
          <input type="file" id="vis-card" ref={imgref} />
        </label>
      )}
      <button className="pbutton" onClick={update}>
        {agent?._id ? "Update" : "Create"}
      </button>
    </div>
  );
};

export default Hotel;
