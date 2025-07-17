"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { agent, Context } from "../_components/ContextProvider";
import { useRouter } from "next/navigation";
import { imgurl, putReq, site } from "../_utils/request";
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
              src={imgurl + info.visiting_card}
              alt=""
            />
          )}
        </>
      ) : (
        <div className="mb-4">
          <input
            type="file"
            id="vis-card"
            ref={imgref}
            accept="image/*"
            onChange={(e) => {
              const fileName = e.target.files?.[0]?.name || "No file chosen";
              document.getElementById(
                "file-name-display"
              ).textContent = `Selected: ${fileName}`;
            }}
            className="block w-full text-sm text-gray-70 file:bg-blue-500 file:text-white file:font-semibold file:py-2 file:px-4 file:rounded file:border-0 file:cursor-pointer hover:file:bg-blue-700"
          />
        </div>
      )}
      <button className="pbutton" onClick={update}>
        {agent?._id ? "Update" : "Create"}
      </button>
    </div>
  );
};

export default Hotel;
