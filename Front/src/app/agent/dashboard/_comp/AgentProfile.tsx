"use client";

import { useContext } from "react";
import { Context } from "../../../_components/ContextProvider";
import { site } from "../../../_utils/request";

const AgentProfile = () => {
  const { agent } = useContext(Context);
  return (
    <div className="grid2">
      <label>Name :</label>
      <p>{agent.name}</p>
      <label>Agency :</label>
      <p>{agent.agency}</p>
      <label>Location :</label>
      <p>{agent.location}</p>
      <label>Whatsapp No:</label>
      <p>{agent.ph1}</p>
      {agent.ph2 && <label>Secondary No:</label>}
      {agent.ph2 && <p>{agent.ph2}</p>}
      {agent.upi_id && <label>Upi ID :</label>}
      {agent.upi_id && <p>{agent.upi_id}</p>}
      {agent.visiting_card && <label>Card :</label>}
      {agent.visiting_card && (
        <img
          style={{ width: 150 }}
          src={site + "imgs/" + agent.visiting_card}
          alt=""
        />
      )}
    </div>
  );
};

export default AgentProfile;
