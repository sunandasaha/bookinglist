"use client";
import React, { useState, useContext, useEffect } from "react";
import { Context } from "../../_components/ContextProvider";
import { Trash2, Plus, Minus } from "lucide-react";

const PerRoomPricingForm = ({ rooms, onUpdateRooms, roomsUsedInOtherCategories }) => {
  const { hosthotel } = useContext(Context);
  const totalRoomsAllowed = hosthotel?.rooms || 0;

  const [editingIndex, setEditingIndex] = useState(rooms.length > 0 ? 0 : null);
  const [localRooms, setLocalRooms] = useState(rooms);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms]);

  const handleChange = (index, field, value) => {
    const updated = [...localRooms];
    updated[index] = { ...updated[index], [field]: value };
    setLocalRooms(updated);
  };

  const handleRoomNumberChange = (roomIndex, value, groupIndex) => {
    const updated = [...localRooms];
    updated[groupIndex].roomNumbers[roomIndex] = value;
    setLocalRooms(updated);
  };

  const addRoomNameField = (groupIndex) => {
    const totalUsed = roomsUsedInOtherCategories + localRooms.reduce((acc, group) => acc + group.roomNumbers.length, 0);
    if (totalUsed >= totalRoomsAllowed) {
      setProblem("You have reached the total number of allowed rooms.");
      return;
    }

    setProblem("");
    const updated = [...localRooms];
    updated[groupIndex].roomNumbers.push("");
    setLocalRooms(updated);
  };

  const removeRoomNameField = (groupIndex, roomIndex) => {
    const updated = [...localRooms];
    if (updated[groupIndex].roomNumbers.length > 1) {
      updated[groupIndex].roomNumbers.splice(roomIndex, 1);
      setLocalRooms(updated);
    }
  };

  const handleAddPhoto = (index, files) => {
    const updated = [...localRooms];
    const currentPhotos = updated[index].photos || [];

    if (currentPhotos.length + files.length > 4) {
      setProblem("Maximum 4 photos allowed.");
      return;
    }

    updated[index].photos = [...currentPhotos, ...Array.from(files).slice(0, 4 - currentPhotos.length)];
    setLocalRooms(updated);
  };

  const removePhoto = (index, photoIndex) => {
    const updated = [...localRooms];
    updated[index].photos.splice(photoIndex, 1);
    setLocalRooms(updated);
  };

  const handleSubmit = (index) => {
    onUpdateRooms(localRooms);
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setProblem("");
  };

  const handleDelete = (index) => {
    const updated = [...localRooms];
    updated.splice(index, 1);
    setLocalRooms(updated);
    onUpdateRooms(updated);

    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex((prev) => prev - 1);
    }
    setProblem("");
  };

  const handleAddNewGroup = () => {
    const newRoomGroup = {
      roomNumbers: [""],
      capacity: "",
      rate: "",
      extraPerson: "",
      agentCommission: "",
      advance: "",
      photos: [],
    };

    const updatedRooms = [...localRooms, newRoomGroup];
    setLocalRooms(updatedRooms);
    onUpdateRooms(updatedRooms);
    setEditingIndex(updatedRooms.length - 1);
  };

  return (
    <div className="space-y-6">
      {problem && <p className="text-red-600 mb-2">{problem}</p>}

      {localRooms.map((room, index) => {
        const isEditing = editingIndex === index;

        return (
          <div key={index} className="border p-4 rounded-md space-y-3 bg-gray-50 shadow relative">
            {isEditing ? (
              <>
                <label className="block font-semibold">Room Names/Numbers</label>
                {room.roomNumbers.map((rName, rIndex) => (
                  <div key={rIndex} className="flex items-center space-x-2 mb-2">
                    <input
                      placeholder={`Room ${rIndex + 1}`}
                      value={rName}
                      onChange={(e) => handleRoomNumberChange(rIndex, e.target.value, index)}
                      className="input w-full"
                    />
                    {rIndex === room.roomNumbers.length - 1 && (
                      <button
                        onClick={() => addRoomNameField(index)}
                        className="text-xl text-blue-600 hover:text-blue-800"
                        type="button"
                      >
                        <Plus />
                      </button>
                    )}
                    {room.roomNumbers.length > 1 && (
                      <button
                        onClick={() => removeRoomNameField(index, rIndex)}
                        className="text-xl text-red-600 hover:text-red-800"
                        type="button"
                      >
                        <Minus />
                      </button>
                    )}
                  </div>
                ))}

                <label className="block font-semibold">Room Capacity</label>
                <input
                  placeholder="Capacity"
                  value={room.capacity}
                  onChange={(e) => handleChange(index, "capacity", e.target.value)}
                  className="input w-full"
                />

                <label className="block font-semibold">Rate</label>
                <input
                  placeholder="Rate"
                  value={room.rate}
                  onChange={(e) => handleChange(index, "rate", e.target.value)}
                  className="input w-full"
                />

                <label className="block font-semibold">Extra Person Charge</label>
                <input
                  placeholder="Extra Person Charge"
                  value={room.extraPerson}
                  onChange={(e) => handleChange(index, "extraPerson", e.target.value)}
                  className="input w-full"
                />

                <label className="block font-semibold">Agent Commission</label>
                <input
                  placeholder="Agent Commission"
                  value={room.agentCommission}
                  onChange={(e) => handleChange(index, "agentCommission", e.target.value)}
                  className="input w-full"
                />

                <label className="block font-semibold">Advance Amount</label>
                <input
                  placeholder="Advance Amount"
                  value={room.advance}
                  onChange={(e) => handleChange(index, "advance", e.target.value)}
                  className="input w-full"
                />

                <label className="block font-semibold">Photos (max 4)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleAddPhoto(index, e.target.files)}
                  className="input w-full"
                  disabled={room.photos?.length >= 4}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {room.photos &&
                    room.photos.map((photo, i) => (
                      <div key={i} className="relative w-20 h-20">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`room-${i}`}
                          className="w-full h-full object-cover rounded"
                        />
                        <button
                          onClick={() => removePhoto(index, i)}
                          className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => handleSubmit(index)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md mt-3"
                >
                  Submit
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">
                    Rooms: {room.roomNumbers.join(", ") || `Group ${index + 1}`}
                  </h3>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p>Capacity: {room.capacity || "-"}</p>
                <p>Rate: ₹{room.rate || "-"}</p>
                <p>Extra Person Charge: ₹{room.extraPerson || "-"}</p>
                <p>Agent Commission: {room.agentCommission || "-"}</p>
                <p>Advance Amount: ₹{room.advance || "-"}</p>
                <p>
                  Photos: {room.photos && room.photos.length > 0 ? `${room.photos.length} uploaded` : "No photos"}
                </p>
              </>
            )}
          </div>
        );
      })}

      <div className="text-center mt-6">
        <button
          onClick={handleAddNewGroup}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Room Category
        </button>
      </div>
    </div>
  );
};

export default PerRoomPricingForm;
