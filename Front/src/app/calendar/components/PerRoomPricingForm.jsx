"use client";

import React, { useState, useContext } from "react";
import { Context } from "../../_components/ContextProvider";
import { Trash2, Plus, X, Edit, Save } from "lucide-react";
import { site, delReq, putReq, imgurl } from "../../_utils/request";
import { facilityOptions } from "./data";

const PerRoomPricingForm = () => {
  const { hosthotel, user, setHosthotel } = useContext(Context);
  const totalRoomsAllowed = hosthotel?.rooms || 0;

  const [categories, setCategories] = useState(
    hosthotel.room_cat?.length > 0
      ? hosthotel.room_cat.map((cat) => ({ ...cat, isEditing: false }))
      : [
          {
            name: "",
            room_no: [""],
            capacity: 0,
            price: 0,
            price_for_extra_person: 0,
            agent_com: { amount: 0, percent: true },
            advance: { amount: 0, percent: true },
            images: [],
            amenities: [],
            isEditing: true,
          },
        ]
  );

  const [problems, setProblems] = useState({});
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const getTotalUsedRooms = () =>
    categories.reduce((total, cat) => total + cat.room_no.length, 0);

  const displayNumber = (num) => (num === 0 || num === null ? "" : num);

  const handleChange = (index, field, value) => {
    const updated = [...categories];

    if (
      [
        "capacity",
        "price",
        "price_for_extra_person",
        "agent_com.amount",
        "advance.amount",
      ].includes(field)
    ) {
      if (value === "") {
        if (field.includes("agent_com")) {
          updated[index].agent_com = updated[index].agent_com || {};
          updated[index].agent_com.amount = 0;
        } else if (field.includes("advance")) {
          updated[index].advance = updated[index].advance || {};
          updated[index].advance.amount = 0;
        } else {
          updated[index][field] = 0;
        }
      } else {
        const numberVal = Number(value);
        if (field === "agent_com.amount") {
          updated[index].agent_com.amount = isNaN(numberVal) ? 0 : numberVal;
        } else if (field === "advance.amount") {
          updated[index].advance.amount = isNaN(numberVal) ? 0 : numberVal;
        } else {
          updated[index][field] = isNaN(numberVal) ? 0 : numberVal;
        }
      }
    } else if (field === "agent_com.percent") {
      updated[index].agent_com.percent = value === "%";
    } else if (field === "advance.percent") {
      updated[index].advance.percent = value === "%";
    } else {
      updated[index][field] = value;
    }
    setCategories(updated);
  };

  const handleFacilitiesChange = (index, chk, am) => {
    const updated = [...categories];
    if (chk) {
      updated[index].amenities = updated[index].amenities.filter(
        (el) => el !== am
      );
    } else {
      updated[index].amenities.push(am);
    }
    setCategories(updated);
  };

  const handleRoomNumberChange = (catIdx, rIdx, value) => {
    const updated = [...categories];
    updated[catIdx].room_no[rIdx] = value;
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
    updated[catIdx].room_no.push("");
    setCategories(updated);
  };

  const removeRoomNumber = (catIdx, rIdx) => {
    const updated = [...categories];
    if (updated[catIdx].room_no.length > 1) {
      updated[catIdx].room_no.splice(rIdx, 1);
      setCategories(updated);
    }
  };

  const handleAddPhoto = (catIdx, files) => {
    const updated = [...categories];
    const currentPhotos = updated[catIdx].images || [];
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
    updated[catIdx].images = [
      ...currentPhotos,
      ...Array.from(files).slice(0, 4 - currentPhotos.length),
    ];
    setCategories(updated);
  };

  const removePhoto = (catIdx, photoIdx) => {
    const updated = [...categories];
    updated[catIdx].images.splice(photoIdx, 1);
    setCategories(updated);
  };
  const toggleEdit = async (index) => {
    const updated = [...categories];
    const cat = updated[index];
    if (categories.length === 1 && cat.name.trim() === "") {
      cat.name = "Normal";
    }
    const set = new Set();
    for (let i = 0; i < cat.room_no.length; i++) {
      cat.room_no[i] = cat.room_no[i].trim();
      if (cat.room_no[i] === "" || set.has(cat.room_no[i])) {
        setProblems((p) => ({
          ...p,
          roomno: "Room name must be unique and not empty",
        }));
        return;
      }
      set.add(cat.room_no[i]);
    }

    if (cat.isEditing) {
      if (cat._id) {
        const result = await putReq("category/room", cat, user.token);
        if (result.success) {
          setHosthotel(result.hotel);
          setCategories(result.hotel.room_cat);
        }
      } else {
        const formData = new FormData();

        const details = {
          name: cat.name,
          capacity: Number(cat.capacity),
          price: Number(cat.price),
          price_for_extra_person: Number(cat.price_for_extra_person),
          agent_com: {
            amount: Number(cat.agent_com.amount),
            percent: cat.agent_com.percent,
          },
          advance: {
            amount: Number(cat.advance.amount),
            percent: cat.advance.percent,
          },
          room_no: cat.room_no,
          amenities: cat.facilities || [],
        };

        formData.append("details", JSON.stringify(details));
        cat.images.forEach((img) => formData.append("images", img));

        try {
          const res = await fetch(site + "category/room", {
            method: "POST",
            headers: { authorization: user.token },
            body: formData,
          });

          const result = await res.json();
          if (result.success && result.hotel?._id) {
            setHosthotel(result.hotel);
            setCategories(result.hotel.room_cat);
          }
        } catch (error) {
          console.error("Failed to save category:", error);
        }
      }
    }

    updated[index].isEditing = !cat.isEditing;
    setCategories(updated);
  };

  const handleDeleteCategory = async (catIdx) => {
    const categoryId = categories[catIdx]._id;
    if (categoryId) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this category?"
      );
      if (!confirmed) return;

      try {
        const result = await delReq(
          `category/room`,
          { _id: categoryId },
          user.token
        );

        console.log(result);
        if (!result.status === "success") {
          alert("Failed to delete category on server.");
          return;
        } else {
          setHosthotel(result.hotel);
          setCategories(result.hotel.room_cat);
        }
      } catch (error) {
        alert("Error deleting category.");
        console.error(error);
        return;
      }
    } else {
      const updated = [...categories];
      updated.splice(catIdx, 1);
      setCategories(updated);
    }
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
        name: "",
        room_no: [""],
        capacity: 0,
        price: 0,
        price_for_extra_person: 0,
        agent_com: { amount: 0, percent: true },
        advance: { amount: 0, percent: true },
        images: [],
        amenities: [],
        isEditing: true,
      },
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
        <div
          key={catIdx}
          className="border rounded p-4 space-y-3 shadow bg-gray-50"
        >
          {/* header */}
          <div className="flex justify-between items-center">
            <input
              value={cat.name}
              placeholder="Category name"
              onChange={(e) => handleChange(catIdx, "name", e.target.value)}
              className="font-semibold text-lg border p-2 rounded w-1/2"
              disabled={!cat.isEditing}
            />
            {!cat.isEditing && (
              <button
                onClick={() => toggleEdit(catIdx)}
                className="text-blue-600"
                title="Edit"
              >
                <Edit size={18} />
              </button>
            )}
          </div>
          {errorMsg && cat.isEditing && (
            <p className="text-red-600 font-medium">{errorMsg}</p>
          )}

          {cat.isEditing && (
            <>
              <div>
                <label className="font-medium">Room Names</label>
                {cat.room_no.map((r, rIdx) => (
                  <div key={rIdx} className="flex gap-2 mb-2">
                    <input
                      value={r}
                      onChange={(e) =>
                        handleRoomNumberChange(catIdx, rIdx, e.target.value)
                      }
                      className="input w-full"
                      placeholder={`Room ${rIdx + 1}`}
                    />
                    {rIdx === cat.room_no.length - 1 && (
                      <button
                        onClick={() => addRoomNumber(catIdx)}
                        type="button"
                      >
                        <Plus />
                      </button>
                    )}
                    {cat.room_no.length > 1 && (
                      <button
                        onClick={() => removeRoomNumber(catIdx, rIdx)}
                        type="button"
                      >
                        <X />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {problems.roomLimit && (
                <p className="text-red-500 text-sm">{problems.roomLimit}</p>
              )}
              <label className="font-medium">Capacity:</label>
              <input
                placeholder="Capacity"
                type="number"
                min={0}
                onWheel={(e) => e.target.blur()}
                value={displayNumber(cat.capacity)}
                onChange={(e) =>
                  handleChange(catIdx, "capacity", e.target.value)
                }
                className="no-spinner border rounded p-2 w-full"
              />
              <label className="font-medium">Price:</label>
              <input
                placeholder="Price"
                type="number"
                min={0}
                onWheel={(e) => e.target.blur()}
                value={displayNumber(cat.price)}
                onChange={(e) => handleChange(catIdx, "price", e.target.value)}
                className="no-spinner border rounded p-2 w-full"
              />
              <label className="font-medium">Price for Extra Person:</label>
              <input
                placeholder="Price for Extra Person"
                type="number"
                min={0}
                onWheel={(e) => e.target.blur()}
                value={displayNumber(cat.price_for_extra_person)}
                onChange={(e) =>
                  handleChange(catIdx, "price_for_extra_person", e.target.value)
                }
                className="no-spinner border rounded p-2 w-full"
              />

              {/* Agent Commission */}
              <div className="space-y-2">
                <label className="font-medium">Agent Commission</label>
                <div className="flex gap-2">
                  <input
                    placeholder="Amount"
                    value={cat.agent_com.amount}
                    type="number"
                    min="0"
                    onWheel={(e) => e.target.blur()}
                    onChange={(e) =>
                      handleChange(catIdx, "agent_com.amount", e.target.value)
                    }
                    className="no-spinner border rounded p-2 w-full"
                  />
                  <select
                    value={cat.agent_com.percent ? "%" : "₹"}
                    onChange={(e) =>
                      handleChange(catIdx, "agent_com.percent", e.target.value)
                    }
                    className="border rounded p-2"
                  >
                    <option value="%">%</option>
                    <option value="₹">₹</option>
                  </select>
                </div>
              </div>

              {/* Advance */}
              <div className="space-y-2">
                <label className="font-medium">Advance</label>
                <div className="flex gap-2">
                  <input
                    placeholder="Amount"
                    type="number"
                    min="0"
                    value={cat.advance.amount}
                    onWheel={(e) => e.target.blur()}
                    onChange={(e) =>
                      handleChange(catIdx, "advance.amount", e.target.value)
                    }
                    className="no-spinner border rounded p-2 w-full"
                  />
                  <select
                    value={cat.advance.percent ? "%" : "₹"}
                    onChange={(e) =>
                      handleChange(catIdx, "advance.percent", e.target.value)
                    }
                    className="border rounded p-2"
                  >
                    <option value="%">%</option>
                    <option value="₹">₹</option>
                  </select>
                </div>
              </div>
              {/* Facilities */}
              <div>
                <label className="font-medium">Amenities</label>
                <div>
                  {facilityOptions.map((e) => {
                    const chk = cat.amenities?.includes(e);
                    return (
                      <div key={e}>
                        <input
                          type="checkbox"
                          className="mx-2"
                          id={e}
                          checked={chk}
                          onChange={() => {
                            handleFacilitiesChange(catIdx, chk, e);
                          }}
                        />
                        <label htmlFor={e}>{e}</label>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Image Upload Section */}
              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Upload Room Photos (max 4):
                </label>
                <div
                  className="border border-gray-400 rounded-md p-4 cursor-pointer text-center text-sm text-blue-500 hover:border-gray-500 transition"
                  onClick={() =>
                    document.getElementById(`imageUpload-${catIdx}`).click()
                  }
                >
                  Click here to select images
                </div>
                <input
                  id={`imageUpload-${catIdx}`}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleAddPhoto(catIdx, e.target.files)}
                  className="hidden"
                />
                <div className="flex gap-2 mt-3 flex-wrap">
                  {cat.images.map((photo, i) => (
                    <div key={i} className="relative w-20 h-20">
                      <img
                        src={
                          cat._id ? imgurl + photo : URL.createObjectURL(photo)
                        }
                        alt={`img-${i}`}
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        className="absolute top-0 right-0 bg-white rounded-full text-red-500 p-0.5 shadow"
                        onClick={() => removePhoto(catIdx, i)}
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {problems[`cat-${catIdx}-images`] && (
                  <p className="text-red-500 text-sm mt-1">
                    {problems[`cat-${catIdx}-images`]}
                  </p>
                )}
              </div>
              <div className="relative flex justify-end gap-4 pt-4 border-t">
                <button
                  onClick={() => handleDeleteCategory(catIdx)}
                  className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-50"
                  disabled={loadingIndex === catIdx}
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => toggleEdit(catIdx)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  disabled={loadingIndex === catIdx}
                >
                  {loadingIndex === catIdx ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save</span>
                    </>
                  )}
                </button>
                {problems.roomno && (
                  <div className="absolute top-[calc(100%+11px)] right-0 text-red-600 text-sm font-medium z-9">
                    {problems.roomno}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ))}

      <div className="text-center">
        <button
          onClick={handleAddCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          type="button"
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
