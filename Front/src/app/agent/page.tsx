"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { agent, Context } from "../_components/ContextProvider";
import { useRouter } from "next/navigation";
import { imgurl, putReq, site } from "../_utils/request";
import AgentForm from "./AgentForm";
import { ArrowLeft, Image } from "lucide-react";

const def: agent = {
  name: "",
  location: "",
  upi_id: "",
  ph1: "",
  agency: "",
  hotel_per: [],
};

const Hotel = () => {
  const { user, agent, setAgent, setUser } = useContext(Context);
  const navigate = useRouter();
  const [info, setInfo] = useState<agent>(agent || def);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const imgref = useRef<HTMLInputElement>(null);

  const update = async () => {
    setErrors({});
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
        console.log("Error Response:", res);
    if (res.status === "success") {
      if (user?.status === 1) {
        setAgent(res.agent);
        navigate.push("/agent/dashboard");
      } else {
        navigate.push("/status");
      }
    }  else {
  if (res.status === "failed" && res.field) {
    setErrors({
      [res.field]: res.message, // e.g., upi_id: "The upi_id is already in use."
    });
  } else {
    alert(res.message || "Something went wrong.");
  }
}

  };

  useEffect(() => {
    if (user?.role !== "agent") {
      navigate.push("/");
    }
  }, []);

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

        <h2 className="text-3xl font-semibold text-blue-900 text-center mb-4">
          👤 Agent Profile
        </h2>

        <div className="w-full max-w-lg bg-white p-6 md:p-10 rounded-2xl shadow-xl mx-auto">
          <AgentForm setInfo={setInfo} info={info} errors={errors} />
          {!info._id && (
            <div className="mt-4">
              <input
                type="file"
                ref={imgref}
                accept="image/*"
                onChange={(e) => {
                  const fileName =
                    e.target.files?.[0]?.name || "No file chosen";
                  document.getElementById(
                    "file-name-display"
                  ).textContent = `Selected: ${fileName}`;
                }}
                className="block w-full text-sm text-gray-700 file:bg-blue-900 file:text-white file:font-medium file:py-2 file:px-4 file:rounded-full file:border-0 file:cursor-pointer hover:file:bg-blue-700"
              />
              <div
                id="file-name-display"
                className="text-sm text-gray-600 mt-1 text-center"
              ></div>
            </div>
          )}

          {info._id && info.visiting_card && (
            <div className="flex items-center justify-center gap-2 text-blue-900 font-medium mb-2 text-center mt-6">
              <Image size={18} />
              <span>Visiting Card:</span>
              <img
                src={imgurl + info.visiting_card}
                alt="Visiting Card"
                className="h-24 w-40 mx-auto rounded shadow"
              />
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              className="bg-blue-900 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition duration-300"
              onClick={update}
            >
              {agent?._id ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hotel;
