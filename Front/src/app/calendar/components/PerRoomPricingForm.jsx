"use client";

import React, { useState, useContext } from "react";
import { Context } from "../../_components/ContextProvider";
import { Trash2, Plus, X, Edit, Save } from "lucide-react";
import { site } from "../../_utils/request";

const facilityOptions = ["Geyser", "TV", "WiFi", "Breakfast", "Food"];

const PerRoomPricingForm = () => {
  const { hosthotel, user } = useContext(Context);
  const totalRoomsAllowed = hosthotel?.rooms || 0;

  const [categories, setCategories] = useState([
    {
      roomData: {
        name: "",
        room_no: [""],
        capacity: "",
        price: "",
        price_for_extra_person: "",
        agent_com: { amount: "", percent: true },
        advance: { amount: "", percent: true },
        images: [],
        facilities: [],
      },
      isEditing: true,
    },
  ]);

  const [problems, setProblems] = useState({});

  const getTotalUsedRooms = () => {
    return categories.reduce((total, cat) => total + cat.roomData.room_no.length, 0);
  };

  const handleChange = (index, field, value) => {
    const updated = [...categories];
    const roomData = updated[index].roomData;

    if (field === "agent_com.amount") {
      roomData.agent_com.amount = value;
    } else if (field === "agent_com.percent") {
      roomData.agent_com.percent = value === "%";
    } else if (field === "advance.amount") {
      roomData.advance.amount = value;
    } else if (field === "advance.percent") {
      roomData.advance.percent = value === "%";
    } else {
      roomData[field] = value;
    }
    setCategories(updated);
  };

  const handleFacilitiesChange = (index, selectedOptions) => {
    const updated = [...categories];
    updated[index].roomData.facilities = selectedOptions;
    setCategories(updated);
  };

  const handleRoomNumberChange = (catIdx, rIdx, value) => {
    const updated = [...categories];
    updated[catIdx].roomData.room_no[rIdx] = value;
    setCategories(updated);
  };

  const addRoomNumber = (catIdx) => {
    if (getTotalUsedRooms() >= totalRoomsAllowed) {
      setProblems((prev) => ({
        ...prev,
        roomLimit: `You can only add ${totalRoomsAllowed} rooms across all categories.`,
      }));
      return;
    }
    setProblems((prev) => {
      const copy = { ...prev };
      delete copy.roomLimit;
      return copy;
    });
    const updated = [...categories];
    updated[catIdx].roomData.room_no.push("");
    setCategories(updated);
  };

  const removeRoomNumber = (catIdx, rIdx) => {
    const updated = [...categories];
    if (updated[catIdx].roomData.room_no.length > 1) {
      updated[catIdx].roomData.room_no.splice(rIdx, 1);
      setCategories(updated);
    }
  };

  const handleAddPhoto = (catIdx, files) => {
    const updated = [...categories];
    const currentPhotos = updated[catIdx].roomData.images || [];
    if (currentPhotos.length + files.length > 4) {
      setProblems((prev) => ({
        ...prev,
        [`cat-${catIdx}-images`]: "Only 4 images allowed per category.",
      }));
      return;
    }
    setProblems((prev) => {
      const copy = { ...prev };
      delete copy[`cat-${catIdx}-images`];
      return copy;
    });
    updated[catIdx].roomData.images = [
      ...currentPhotos,
      ...Array.from(files).slice(0, 4 - currentPhotos.length),
    ];
    setCategories(updated);
  };

  const removePhoto = (catIdx, photoIdx) => {
    const updated = [...categories];
    updated[catIdx].roomData.images.splice(photoIdx, 1);
    setCategories(updated);
  };

  const toggleEdit = async (index) => {
    const updated = [...categories];
    const cat = updated[index];

    if (cat.isEditing) {
      // Prepare form data for submission
      const formData = new FormData();
      const data = cat.roomData;

      const details = {
        name: data.name,
        capacity: Number(data.capacity),
        price: Number(data.price),
        price_for_extra_person: Number(data.price_for_extra_person),
        agent_com: {
          amount: Number(data.agent_com.amount),
          percent: data.agent_com.percent,
        },
        advance: {
          amount: Number(data.advance.amount),
          percent: data.advance.percent,
        },
        room_no: data.room_no,
        amenities: data.facilities || [],
      };

      formData.append("details", JSON.stringify(details));

      data.images.forEach((img) => formData.append("images", img));

      const isUpdate = !!data._id;
      const url = isUpdate
        ? site + `category/room/${data._id}`
        : site + "category/room";
      const method = isUpdate ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: { authorization: user.token },
          body: formData,
        });

        const result = await res.json();
        console.log(result);

        if (result.success && result.data?._id && !isUpdate) {
          updated[index].roomData._id = result.data._id;
        }
      } catch (error) {
        console.error("Failed to save category:", error);
      }
    }

    updated[index].isEditing = !cat.isEditing;
    setCategories(updated);
  };

  const handleAddCategory = () => {
    if (getTotalUsedRooms() >= totalRoomsAllowed) {
      setProblems((prev) => ({
        ...prev,
        roomLimit: `You can only add ${totalRoomsAllowed} rooms across all categories.`,
      }));
      return;
    }
    setProblems((prev) => {
      const copy = { ...prev };
      delete copy.roomLimit;
      return copy;
    });
    setCategories([
      ...categories,
      {
        roomData: {
          name: "",
          room_no: [""],
          capacity: "",
          price: "",
          price_for_extra_person: "",
          agent_com: { amount: "", percent: true },
          advance: { amount: "", percent: true },
          images: [],
          facilities: [],
        },
        isEditing: true,
      },
    ]);
  };

  const handleCategoryNameChange = (index, value) => {
    const updated = [...categories];
    updated[index].roomData.name = value;
    setCategories(updated);
  };

  return (
    <div className="space-y-6">
      {categories.map((cat, catIdx) => (
        <div
          key={catIdx}
          className="border rounded p-4 space-y-3 shadow bg-gray-50"
        >
          <div className="flex justify-between items-center">
            <input
              value={cat.roomData.name}
              onChange={(e) => handleCategoryNameChange(catIdx, e.target.value)}
              placeholder="Leave this if no category"
              className="font-semibold text-lg border p-1 rounded w-1/2"
              disabled={!cat.isEditing}
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
                {cat.roomData.room_no.map((r, rIdx) => (
                  <div key={rIdx} className="flex gap-2 mb-2">
                    <input
                      value={r}
                      onChange={(e) =>
                        handleRoomNumberChange(catIdx, rIdx, e.target.value)
                      }
                      className="input w-full"
                      placeholder={`Room ${rIdx + 1}`}
                    />
                    {rIdx === cat.roomData.room_no.length - 1 && (
                      <button onClick={() => addRoomNumber(catIdx)}>
                        <Plus />
                      </button>
                    )}
                    {cat.roomData.room_no.length > 1 && (
                      <button onClick={() => removeRoomNumber(catIdx, rIdx)}>
                        <X />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {problems.roomLimit && (
                <p className="text-red-500 text-sm">{problems.roomLimit}</p>
              )}
              <input
                placeholder="Capacity"
                value={cat.roomData.capacity}
                onChange={(e) => handleChange(catIdx, "capacity", e.target.value)}
                className="input w-full"
              />
              <input
                placeholder="Price"
                value={cat.roomData.price}
                onChange={(e) => handleChange(catIdx, "price", e.target.value)}
                className="input w-full"
              />
              <input
                placeholder="Price for Extra Person"
                value={cat.roomData.price_for_extra_person}
                onChange={(e) =>
                  handleChange(catIdx, "price_for_extra_person", e.target.value)
                }
                className="input w-full"
              />

              {/* Agent Commission */}
              <div className="flex gap-2">
                <input
                  placeholder="Agent Commission"
                  value={cat.roomData.agent_com.amount}
                  onChange={(e) =>
                    handleChange(catIdx, "agent_com.amount", e.target.value)
                  }
                  className="input w-full"
                />
                <select
                  value={cat.roomData.agent_com.percent ? "%" : "₹"}
                  onChange={(e) =>
                    handleChange(catIdx, "agent_com.percent", e.target.value)
                  }
                  className="input"
                >
                  <option value="%">%</option>
                  <option value="₹">₹</option>
                </select>
              </div>

              {/* Advance */}
              <div className="flex gap-2">
                <input
                  placeholder="Advance"
                  value={cat.roomData.advance.amount}
                  onChange={(e) => handleChange(catIdx, "advance.amount", e.target.value)}
                  className="input w-full"
                />
                <select
                  value={cat.roomData.advance.percent ? "%" : "₹"}
                  onChange={(e) =>
                    handleChange(catIdx, "advance.percent", e.target.value)
                  }
                  className="input"
                >
                  <option value="%">%</option>
                  <option value="₹">₹</option>
                </select>
              </div>

              {/* Facilities */}
              <div>
                <label className="font-medium">Facilities</label>
                <select
                  multiple
                  value={cat.roomData.facilities}
                  onChange={(e) =>
                    handleFacilitiesChange(
                      catIdx,
                      Array.from(e.target.selectedOptions).map((opt) => opt.value)
                    )
                  }
                  className="input w-full h-28"
                >
                  {facilityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleAddPhoto(catIdx, e.target.files)}
              />
              {problems[`cat-${catIdx}-images`] && (
                <p className="text-red-500 text-sm">{problems[`cat-${catIdx}-images`]}</p>
              )}
              <div className="flex gap-2 flex-wrap">
                {cat.roomData.images.map((photo, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img
                      src={URL.createObjectURL(photo)}
                      className="w-full h-full object-cover rounded"
                      alt={`room-img-${i}`}
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
        {problems.roomLimit && (
          <p className="text-red-500 text-sm mt-2">{problems.roomLimit}</p>
        )}
      </div>
    </div>
  );
};

export default PerRoomPricingForm;
