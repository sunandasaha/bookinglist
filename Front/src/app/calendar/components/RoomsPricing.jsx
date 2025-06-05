"use client";
import { useState } from "react";
import PerRoomPricingForm from "./PerRoomPricingForm";
import PerPersonPricingForm from "./PerPersonPricingForm";

const RoomsPricing = () => {
  const [pricingType, setPricingType] = useState("perRoom");
  const [categories, setCategories] = useState([
    { name: "Deluxe", rooms: [] },
    { name: "Standard", rooms: [] },
  ]);
  const getTotalRoomsUsedExceptCategory = (excludeIndex) => {
    return categories.reduce((sum, cat, idx) => {
      if (idx === excludeIndex) return sum;
      return sum + cat.rooms.length;
    }, 0);
  };

  const handleCategoryRoomUpdate = (categoryIndex, updatedRooms) => {
    const updated = [...categories];
    updated[categoryIndex].rooms = updatedRooms;
    setCategories(updated);
  };

  const addCategory = () => {
    setCategories([...categories, { name: "", rooms: [] }]);
  };

  const handleCategoryNameChange = (index, value) => {
    const updated = [...categories];
    updated[index].name = value;
    setCategories(updated);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold mb-4">Rooms & Pricing</h2>

      <div className="space-x-4 mb-4">
        <button
          onClick={() => setPricingType("perRoom")}
          className={`px-4 py-2 rounded ${
            pricingType === "perRoom" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Per Room
        </button>
        <button
          onClick={() => setPricingType("perPerson")}
          className={`px-4 py-2 rounded ${
            pricingType === "perPerson" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Per Person
        </button>
      </div>

      {categories.map((category, index) => (
        <div
          key={index}
          className="border p-4 rounded-md bg-white shadow space-y-4"
        >
          <input
            type="text"
            placeholder="Category Name (e.g., Deluxe)"
            value={category.name}
            onChange={(e) => handleCategoryNameChange(index, e.target.value)}
            className="input w-full"
          />

          {pricingType === "perRoom" ? (
            <PerRoomPricingForm
              rooms={category.rooms}
              onUpdateRooms={(updatedRooms) =>
                handleCategoryRoomUpdate(index, updatedRooms)
              }
              roomsUsedInOtherCategories={getTotalRoomsUsedExceptCategory(index)}
            />
          ) : (
            <PerPersonPricingForm
              data={category.rooms[0] || {}}
              onUpdate={(roomData) => handleCategoryRoomUpdate(index, [roomData])}
            />
          )}
        </div>
      ))}

      <button
        onClick={addCategory}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        + Add New Category
      </button>
    </div>
  );
};

export default RoomsPricing;
