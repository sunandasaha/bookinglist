"use client";
import { useContext, useState } from "react";
import { Context } from "../../_components/ContextProvider";
import PerRoomPricingForm from "./PerRoomPricingForm";
import PerPersonPricingForm from "./PerPersonPricingForm";
import { X, Plus } from "lucide-react"; 

const RoomsPricing = () => {
  const { hosthotel } = useContext(Context);
  const pricingType = hosthotel?.pay_per?.person ? "perPerson" : "perRoom";

  const [categories, setCategories] = useState([
    { name: "AC rooms", rooms: [] },
    { name: "Normal rooms", rooms: [] },
  ]);
  const [problem, setProblem] = useState("");
  const [showSection, setShowSection] = useState(true); 

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

  const handleCategoryNameChange = (index, value) => {
    const updated = [...categories];
    updated[index].name = value;
    setCategories(updated);
  };

  const removeCategory = (index) => {
    if (categories.length === 1) {
      setProblem("At least one category is required.");
      return;
    }
    const updated = [...categories];
    updated.splice(index, 1);
    setCategories(updated);
    setProblem("");
  };

  const handleAddCategory = () => {
    const newCategory = { name: "New Category", rooms: [] };
    setCategories([...categories, newCategory]);
  };

  if (!showSection) return null;

  return (
    <div className="p-4 space-y-6 border border-gray-300 rounded-lg shadow bg-white relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
        onClick={() => setShowSection(false)}
        title="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-xl font-semibold mb-4">Rooms & Pricing</h2>

      {problem && <p className="text-red-600">{problem}</p>}

      {categories.map((category, index) => (
        <div
          key={index}
          className="border p-4 rounded-md bg-gray-50 shadow space-y-4 relative"
        >
          <button
            className="absolute top-2 right-2 text-red-600 hover:text-red-800"
            onClick={() => removeCategory(index)}
            title="Remove Category"
          >
            <X className="w-5 h-5" />
          </button>
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
              onUpdate={(roomData) =>
                handleCategoryRoomUpdate(index, [roomData])
              }
            />
          )}
        </div>
      ))}
      <div className="text-right">
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>
    </div>
  );
};

export default RoomsPricing;
