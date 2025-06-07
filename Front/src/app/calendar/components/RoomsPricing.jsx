"use client";
import { useContext } from "react";
import { Context } from "../../_components/ContextProvider";
import PerRoomPricingForm from "./PerRoomPricingForm";
import PerPersonPricingForm from "./PerPersonPricingForm";
const RoomsPricing=()=>{
  const{ hosthotel } = useContext(Context);
  const PricingType = hosthotel?.pay_per? "PerPerson" : "PerRoom";
  return(
    <div className="p-4  border shadow rounded bg white ">
      <h2 className = "text-xl font-bold mb-4">Rooms & Pricing</h2>
      {PricingType === "PerPerson"?(
        <PerPersonPricingForm />): (
          <PerRoomPricingForm />
      )}
    </div>
);
};
export default RoomsPricing;