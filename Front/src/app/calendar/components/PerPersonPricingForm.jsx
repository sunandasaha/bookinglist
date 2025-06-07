"use client";
import React, { useState, useContext } from "react";
import { Context } from "../../_components/ContextProvider";
import { Trash2, Plus, X, Edit, Save } from "lucide-react";

const PerPersonPricingForm = () => {
  const { hosthotel } = useContext(Context);
  const totalRoomsAllowed = hosthotel?.rooms || 0;

  const [categories, setCategories] = useState([
    {
      name: "AC Rooms",
      roomData: {
        roomNumbers: [""],
        capacity: "",
        rate1: "",
        rate2: "",
        rate3: "",
        rate4: "",
        agentCommission: "",
        agentCommissionType: "%",
        advance: "",
        photos: []
      },
      isEditing: true
    }
  ]);

  const getTotalUsedRooms = () =>
    categories.reduce((total, cat) => total + cat.roomData.roomNumbers.length, 0);

  const handleChange = (index, field, value) => {
    const updated = [...categories];
    updated[index].roomData[field] = value;
    setCategories(updated);
  };

  const handleRoomNumberChange = (catIdx, rIdx, value) => {
    const updated = [...categories];
    updated[catIdx].roomData.roomNumbers[rIdx] = value;
    setCategories(updated);
  };

  const addRoomNumber = (catIdx) => {
    if (getTotalUsedRooms() >= totalRoomsAllowed) return;
    const updated = [...categories];
    updated[catIdx].roomData.roomNumbers.push("");
    setCategories(updated);
  };

  const removeRoomNumber = (catIdx, rIdx) => {
    const updated = [...categories];
    if (updated[catIdx].roomData.roomNumbers.length > 1) {
      updated[catIdx].roomData.roomNumbers.splice(rIdx, 1);
      setCategories(updated);
    }
  };

  const handleAddPhoto = (catIdx, files) => {
    const updated = [...categories];
    const currentPhotos = updated[catIdx].roomData.photos || [];
    if (currentPhotos.length + files.length > 4) return;
    updated[catIdx].roomData.photos = [...currentPhotos, ...Array.from(files).slice(0, 4 - currentPhotos.length)];
    setCategories(updated);
  };

  const removePhoto = (catIdx, photoIdx) => {
    const updated = [...categories];
    updated[catIdx].roomData.photos.splice(photoIdx, 1);
    setCategories(updated);
  };

  const toggleEdit = (index) => {
    const updated = [...categories];
    updated[index].isEditing = !updated[index].isEditing;
    setCategories(updated);
  };

  const handleAddCategory = () => {
    if (getTotalUsedRooms() >= totalRoomsAllowed) return;
    setCategories([
      ...categories,
      {
        name: "New Category",
        roomData: {
          roomNumbers: [""],
          capacity: "",
          rate1: "",
          rate2: "",
          rate3: "",
          rate4: "",
          agentCommission: "",
          agentCommissionType: "%",
          advance: "",
          photos: []
        },
        isEditing: true
      }
    ]);
  };

  const handleCategoryNameChange = (index, value) => {
    const updated = [...categories];
    updated[index].name = value;
    setCategories(updated);
  };

  return (
    <div className="space-y-6">
      {categories.map((cat, catIdx) => (
        <div key={catIdx} className="border rounded p-4 space-y-3 shadow bg-gray-50">
          <div className="flex justify-between items-center">
            <input
              value={cat.name}
              onChange={(e) => handleCategoryNameChange(catIdx, e.target.value)}
              className="font-semibold text-lg border p-1 rounded w-1/2"
            />
            <div className="flex gap-3 items-center">
              <button onClick={() => toggleEdit(catIdx)} className="text-blue-600">
                {cat.isEditing ? <Save size={18} /> : <Edit size={18} />}
              </button>
              <button
                onClick={() => {
                  const updated = [...categories];
                  updated.splice(catIdx, 1);
                  setCategories(updated);
                }}
                className="text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {cat.isEditing && (
            <>
              <div>
                <label className="font-medium">Room Names</label>
                {cat.roomData.roomNumbers.map((r, rIdx) => (
                  <div key={rIdx} className="flex gap-2 mb-2">
                    <input
                      value={r}
                      onChange={(e) => handleRoomNumberChange(catIdx, rIdx, e.target.value)}
                      className="input w-full"
                      placeholder={`Room ${rIdx + 1}`}
                    />
                    {rIdx === cat.roomData.roomNumbers.length - 1 && (
                      <button onClick={() => addRoomNumber(catIdx)}><Plus /></button>
                    )}
                    {cat.roomData.roomNumbers.length > 1 && (
                      <button onClick={() => removeRoomNumber(catIdx, rIdx)}><X /></button>
                    )}
                  </div>
                ))}
              </div>
              <input
                placeholder="Capacity"
                value={cat.roomData.capacity}
                onChange={(e) => handleChange(catIdx, "capacity", e.target.value)}
                className="input w-full"
              />
              {[1, 2, 3, 4].map((num) => (
                <input
                  key={num}
                  placeholder={`Rate for ${num} person${num > 1 ? "s" : ""}`}
                  value={cat.roomData[`rate${num}`]}
                  onChange={(e) => handleChange(catIdx, `rate${num}`, e.target.value)}
                  className="input w-full"
                />
              ))}
              <div className="flex gap-2">
                <input
                  placeholder="Agent Commission"
                  value={cat.roomData.agentCommission}
                  onChange={(e) => handleChange(catIdx, "agentCommission", e.target.value)}
                  className="input w-full"
                />
                <select
                  value={cat.roomData.agentCommissionType}
                  onChange={(e) => handleChange(catIdx, "agentCommissionType", e.target.value)}
                  className="input"
                >
                  <option value="%">%</option>
                  <option value="₹">₹</option>
                </select>
              </div>
              <input
                placeholder="Advance"
                value={cat.roomData.advance}
                onChange={(e) => handleChange(catIdx, "advance", e.target.value)}
                className="input w-full"
              />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleAddPhoto(catIdx, e.target.files)}
              />
              <div className="flex gap-2 flex-wrap">
                {cat.roomData.photos.map((photo, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img
                      src={URL.createObjectURL(photo)}
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      className="absolute top-0 right-0 text-red-500"
                      onClick={() => removePhoto(catIdx, i)}
                    >
                      <X />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}

      <div className="text-center">
        <button
          onClick={handleAddCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Category
        </button>
      </div>
    </div>
  );
};

export default PerPersonPricingForm;
