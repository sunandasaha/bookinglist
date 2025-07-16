"use client";
import React, { useState, useContext } from "react";
import { Context } from "../../_components/ContextProvider";
import { Trash2, Plus, X, Edit, Save } from "lucide-react";
import { putReq, site, delReq } from "../../_utils/request";

const facilityOptions = ["Geyser", "TV", "WiFi", "Breakfast", "Food", "Room service", "Balcony"];

const PerPersonPricingForm = () => {
  const { hosthotel, setHosthotel, user } = useContext(Context);
  const totalRoomsAllowed = hosthotel?.rooms || 0;
  const [problems, setProblems] = useState({});
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [categories, setCategories] = useState(
    hosthotel.per_person_cat?.length > 0
      ? hosthotel.per_person_cat.map(cat => ({ ...cat, isEditing: false }))
      : [
          {
            name: "",
            roomNumbers: [""],
            capacity: 0,
            rate1: 0,
            rate2: 0,
            rate3: 0,
            rate4: 0,
            agentCommission: { amount: 0, percent: true },
            advance: { amount: 0, percent: true },
            images: [],
            amenities: [],
            isEditing: true,
          },
        ]
  );

  const getTotalUsedRooms = () =>
    categories.reduce((total, cat) => total + cat.roomNumbers.length, 0);

  const handleChange = (index, field, value) => {
    const updated = [...categories];
    if (["capacity", "rate1", "rate2", "rate3", "rate4"].includes(field)) {
      updated[index][field] = value === "" ? 0 : Number(value);
    } 
    else if (field === "agentCommission.amount") {
      updated[index].agentCommission.amount = value === "" ? 0 : Number(value);
    } 
    else if (field === "advance.amount") {
      updated[index].advance.amount = value === "" ? 0 : Number(value);
    } 
    else if (field === "agentCommission.percent") {
      updated[index].agentCommission.percent = value === "%";
    } 
    else if (field === "advance.percent") {
      updated[index].advance.percent = value === "%";
    } 
    else {
      updated[index][field] = value;
    }
    const cap = updated[index].capacity;
    const baseRate = updated[index][`rate${cap}`];
      if (cap && baseRate) {
        setErrorMsg(prev => {
          const copy = { ...prev };
          delete copy[index];
          return copy;
        });
      }
    setCategories(updated);
  };

  const handleFacilitiesChange = (index, selectedOptions) => {
    const updated = [...categories];
    updated[index].amenities = selectedOptions;
    setCategories(updated);
  };
   const toggleEdit = async (index) => {
    const updated = [...categories];
    const cat = updated[index];

    if (!cat.isEditing) {
      updated[index].isEditing = true;
      setCategories(updated);
      return;
    }

    const baseRate = cat[`rate${cat.capacity}`];
    if (!cat.capacity || !baseRate) {
        setErrorMsg(prev => ({ ...prev, [index]: `Rate for (${cat.capacity || "?"}) occupancy is required.` }));
        return;
      }
    setLoadingIndex(index);
    try {
      if (cat._id) {
        const result = await putReq("category/perperson", cat, user.token);
        if (result.success) {
          setHosthotel(result.hotel);
          setCategories(result.hotel.per_person_cat);
        }
      } else {
        const fd = new FormData();
        fd.append("details", JSON.stringify({ ...cat, images: [] }));
        cat.images.forEach(f => fd.append("images", f));

        const res = await fetch(site + "category/perperson", {
          method: "POST",
          headers: { authorization: user.token },
          body: fd,
        });
        const result = await res.json();
        if (result.success && result.data?._id) {
            updated[index]._id = result.data._id;
          }
      }
    } catch (err) {
      console.error("Failed to save category:", err);
      setErrorMsg("Failed to save. Please try again.");
    } finally {
      updated[index].isEditing = !cat.isEditing;
      setLoadingIndex(null);
    }
  };
  const handleRoomNumberChange = (catIdx, rIdx, value) => {
    const updated = [...categories];
    updated[catIdx].roomNumbers[rIdx] = value;
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
    updated[catIdx].roomNumbers.push("");
    setCategories(updated);
  };

  const removeRoomNumber = (catIdx, rIdx) => {
    const updated = [...categories];
    if (updated[catIdx].roomNumbers.length > 1) {
      updated[catIdx].roomNumbers.splice(rIdx, 1);
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
  
  const handleDeleteCategory = async (catIdx) => {
    const categoryId = categories[catIdx]._id;
    if (categoryId) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this category?"
      );
      if (!confirmed) return;

      try {
        const result = await delReq(
          `category/perperson`,
          { _id: categoryId },
          user.token
        );

        console.log(result);
        if (result.status === "success") {
          setHosthotel(result.hotel);
          setCategories(result.hotel.per_person_cat);
        } else {
          alert("Failed to delete category on server.");
          return;
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
        roomNumbers: [""],
        capacity: 0,
        rate1: 0,
        rate2: 0,
        rate3: 0,
        rate4: 0,
        agentCommission: { amount: 0, percent: true },
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
        <div key={catIdx} className="border rounded-xl p-4 space-y-4 shadow bg-white">
          {/* Header */}
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
          {cat.isEditing && (
            <>
              {/* Room Numbers */}
              <div>
                <label className="font-medium">Room Names</label>
                {cat.roomNumbers.map((r, rIdx) => (
                  <div key={rIdx} className="flex gap-2 mb-2">
                    <input
                      value={r}
                      onChange={(e) =>
                        handleRoomNumberChange(catIdx, rIdx, e.target.value)
                      }
                      className="input w-full"
                      placeholder={`Room ${rIdx + 1}`}
                    />
                    {rIdx === cat.roomNumbers.length - 1 && (
                      <button onClick={() => addRoomNumber(catIdx)}>
                        <Plus />
                      </button>
                    )}
                    {cat.roomNumbers.length > 1 && (
                      <button onClick={() => removeRoomNumber(catIdx, rIdx)}>
                        <X />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Capacity */}
              <label className="font-medium">Capacity</label>
              <input
                placeholder="Capacity"
                value={cat.capacity}
                onChange={(e) => handleChange(catIdx, "capacity", e.target.value)}
                className="no-spinner border rounded p-2 w-full"
                type="number"
                onWheel={(e) => e.target.blur()} 
                min="0"
              />
              {/* Rates with Labels */}
                <div className="space-y-2">
                  <label className="font-medium">Rates (Per Person)</label>
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num}>
                      <label className="text-sm text-gray-600 flex items-center gap-1">
                        {num} occupancy
                        {cat.capacity === num && <span className="text-red-700 font-bold text-xl">*</span>}
                      </label>
                      <input
                        placeholder="Enter rate per person"
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        min="0"
                        value={cat[`rate${num}`] === 0 ? "" : cat[`rate${num}`]}
                        onChange={(e) =>
                          handleChange(catIdx, `rate${num}`, e.target.value)
                        }
                        className="no-spinner border rounded p-2 w-full"
                      />
                    </div>
                  ))}
                </div>
              {/* Agent Commission */}
              <div className="space-y-2">
                <label className="font-medium">Agent Commission</label>
                <div className="flex gap-2">
                  <input
                    placeholder="Amount"
                    value={cat.agentCommission.amount}
                    type="number"
                    onWheel={(e) => e.target.blur()} 
                    min="0"
                    onChange={(e) => handleChange(catIdx, "agentCommission.amount", e.target.value)}
                    className="no-spinner border rounded p-2 w-full"
                  />
                  <select
                    value={cat.agentCommission.percent ? "%" : "₹"}
                    onChange={(e) => handleChange(catIdx, "agentCommission.percent", e.target.value)}
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
                    onWheel={(e) => e.target.blur()} 
                    value={cat.advance.amount}
                    onChange={(e) => handleChange(catIdx, "advance.amount", e.target.value)}
                    className="no-spinner border rounded p-2 w-full"
                  />
                  <select
                    value={cat.advance.percent ? "%" : "₹"}
                    onChange={(e) => handleChange(catIdx, "advance.percent", e.target.value)}
                    className="border rounded p-2"
                  >
                    <option value="%">%</option>
                    <option value="₹">₹</option>
                  </select>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="font-medium">Amenities</label>
                <select
                  multiple
                  value={cat.amenities}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                    handleFacilitiesChange(catIdx, selected);
                  }}
                  className="border rounded p-2 w-full h-28"
                >
                  {facilityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {/* Image Upload */}
               <div className="mb-4">
                  <label className="block font-medium mb-1">Upload Room Photos (max 4):</label>
                  <div
                      className="border border-gray-400 rounded-md p-4 cursor-pointer text-center text-sm text-blue-500 hover:border-gray-500 transition"
                      onClick={() => document.getElementById(`imageUpload-${catIdx}`).click()}
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
                              src={cat._id ? site + "imgs/" + photo : URL.createObjectURL(photo)}
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
                          <p className="text-red-500 text-sm mt-1">{problems[`cat-${catIdx}-images`]}</p>
                        )}
                  </div>
              {/* Action Buttons at Bottom */}
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
                    {errorMsg[catIdx] && (
                      <div className="absolute top-[calc(100%+11px)] right-0  text-red-600 text-sm font-medium z-9">
                        {errorMsg[catIdx]}
                      </div>
                    )}
                  </div>

            </>
          )}
        </div>
      ))}
      {/* Add Category Button */}
      <div className="text-center">
        <button
          onClick={handleAddCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          type="button"
          disabled={getTotalUsedRooms() >= totalRoomsAllowed}
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

export default PerPersonPricingForm;