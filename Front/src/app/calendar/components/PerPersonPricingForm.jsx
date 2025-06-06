"use client";
import React, { useState } from "react";

const PerPersonPricingForm = ({ data, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [localData, setLocalData] = useState(data);

  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onUpdate(localData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="border p-4 rounded-md space-y-3 bg-gray-50 shadow relative">
      {isEditing ? (
        <>
          <input
            placeholder="Room Capacity"
            value={localData.capacity || ""}
            onChange={(e) => handleChange("capacity", e.target.value)}
            className="input w-full"
          />
          <input
            placeholder="Rate for 1 Person"
            value={localData.rate1 || ""}
            onChange={(e) => handleChange("rate1", e.target.value)}
            className="input w-full"
          />
          <input
            placeholder="Rate for 2 Persons"
            value={localData.rate2 || ""}
            onChange={(e) => handleChange("rate2", e.target.value)}
            className="input w-full"
          />
          <input
            placeholder="Rate for 3 Persons"
            value={localData.rate3 || ""}
            onChange={(e) => handleChange("rate3", e.target.value)}
            className="input w-full"
          />
          <input
            placeholder="Rate for 4 Persons"
            value={localData.rate4 || ""}
            onChange={(e) => handleChange("rate4", e.target.value)}
            className="input w-full"
          />
          <input
            placeholder="Agent Commission"
            value={localData.agentCommission || ""}
            onChange={(e) => handleChange("agentCommission", e.target.value)}
            className="input w-full"
          />
          <input
            placeholder="Advance Amount"
            value={localData.advance || ""}
            onChange={(e) => handleChange("advance", e.target.value)}
            className="input w-full"
          />
          <input
            type="file"
            multiple
            onChange={(e) => handleChange("photos", [...e.target.files])}
            className="input w-full"
          />
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded-md mt-2"
          >
            Submit
          </button>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">
              Capacity: {localData.capacity || "-"}
            </h3>
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>
          </div>
          <p>Rate for 1 Person: {localData.rate1 || "-"}</p>
          <p>Rate for 2 Persons: {localData.rate2 || "-"}</p>
          <p>Rate for 3 Persons: {localData.rate3 || "-"}</p>
          <p>Rate for 4 Persons: {localData.rate4 || "-"}</p>
          <p>Agent Commission: {localData.agentCommission || "-"}</p>
          <p>Advance Amount: {localData.advance || "-"}</p>
          <p>
            Photos:{" "}
            {localData.photos && localData.photos.length > 0
              ? `${localData.photos.length} uploaded`
              : "No photos"}
          </p>
        </>
      )}
    </div>
  );
};

export default PerPersonPricingForm;
