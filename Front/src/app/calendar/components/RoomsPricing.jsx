"use client";
import { useContext } from "react";
import { Context } from "../../_components/ContextProvider";
import PerRoomPricingForm from "./PerRoomPricingForm";
import PerPersonPricingForm from "./PerPersonPricingForm";

const RoomsPricing = ({ cb }) => {
  const { hosthotel } = useContext(Context);
  const pricingType = hosthotel?.pay_per?.room ? "PerRoom" : "PerPerson";

  console.log("hosthotel:", hosthotel);
  console.log("pay_per:", hosthotel?.pay_per);

  if (!hosthotel) {
    return <div>Loading hotel data...</div>;
  }

  return (
    <div className="p-4 border shadow rounded bg-white">
      <h2 className="text-xl font-bold mb-4">Rooms & Pricing</h2>
      {pricingType === "PerPerson" ? (
        <PerPersonPricingForm cb={cb} />
      ) : (
        <PerRoomPricingForm cb={cb} />
      )}
    </div>
  );
};

export default RoomsPricing;
