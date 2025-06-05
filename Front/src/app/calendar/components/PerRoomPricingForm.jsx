"use client";
import React, { useState, useContext, useEffect } from "react";
import { Context } from "../../_components/ContextProvider";

const PerRoomPricingForm = ({ rooms, onUpdateRooms, roomsUsedInOtherCategories }) => {
  const { hosthotel } = useContext(Context);
  const totalRoomsAllowed = hosthotel?.rooms || 0;

  const [editingIndex, setEditingIndex] = useState(null);
  const [localRooms, setLocalRooms] = useState(rooms);

  useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms]);

  const handleChange = (index, field, value) => {
    const updated = [...localRooms];
    updated[index] = { ...updated[index], [field]: value };
    setLocalRooms(updated);
  };

  const handleSubmit = (index) => {
    onUpdateRooms(localRooms);
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
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
  };

  const handleAddRoom = () => {
    const totalUsed = roomsUsedInOtherCategories + localRooms.length;
    if (totalUsed >= totalRoomsAllowed) {
      alert(
        `You can add only up to ${totalRoomsAllowed} rooms across all categories as registered.`
      );
      return;
    }

    const newRoom = {
      roomNumber: "",
      capacity: "",
      rate: "",
      extraPerson: "",
      agentCommission: "",
      advance: "",
      photos: [],
    };

    const updatedRooms = [...localRooms, newRoom];
    setLocalRooms(updatedRooms);
    onUpdateRooms(updatedRooms);
    setEditingIndex(updatedRooms.length - 1);
  };

  return (
    <div className="space-y-6">
      {localRooms.map((room, index) => {
        const isEditing = editingIndex === index;

        return (
          <div
            key={index}
            className="border p-4 rounded-md space-y-3 bg-gray-50 shadow relative"
          >
            {isEditing ? (
              <>
                <input
                  placeholder="Room Number"
                  value={room.roomNumber}
                  onChange={(e) => handleChange(index, "roomNumber", e.target.value)}
                  className="input w-full"
                />
                <input
                  placeholder="Capacity"
                  value={room.capacity}
                  onChange={(e) => handleChange(index, "capacity", e.target.value)}
                  className="input w-full"
                />
                <input
                  placeholder="Rate"
                  value={room.rate}
                  onChange={(e) => handleChange(index, "rate", e.target.value)}
                  className="input w-full"
                />
                <input
                  placeholder="Extra Person Charge"
                  value={room.extraPerson}
                  onChange={(e) => handleChange(index, "extraPerson", e.target.value)}
                  className="input w-full"
                />
                <input
                  placeholder="Agent Commission"
                  value={room.agentCommission}
                  onChange={(e) =>
                    handleChange(index, "agentCommission", e.target.value)
                  }
                  className="input w-full"
                />
                <input
                  placeholder="Advance Amount"
                  value={room.advance}
                  onChange={(e) => handleChange(index, "advance", e.target.value)}
                  className="input w-full"
                />
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    handleChange(index, "photos", [...e.target.files])
                  }
                  className="input w-full"
                />
                <button
                  onClick={() => handleSubmit(index)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md mt-2"
                >
                  Submit
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">
                    Room {room.roomNumber || index + 1}
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
                <p>Rate: {room.rate || "-"}</p>
                <p>Extra Person Charge: {room.extraPerson || "-"}</p>
                <p>Agent Commission: {room.agentCommission || "-"}</p>
                <p>Advance Amount: {room.advance || "-"}</p>
                <p>
                  Photos:{" "}
                  {room.photos && room.photos.length > 0
                    ? `${room.photos.length} uploaded`
                    : "No photos"}
                </p>
              </>
            )}
          </div>
        );
      })}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleAddRoom}
          className="text-4xl font-bold text-blue-600 hover:text-blue-800"
          title={`Add another room (Max ${totalRoomsAllowed})`}
          disabled={localRooms.length + roomsUsedInOtherCategories >= totalRoomsAllowed}
        >
          +
        </button>
        {localRooms.length + roomsUsedInOtherCategories >= totalRoomsAllowed && (
          <p className="text-sm text-red-600 mt-1">
            You have reached the maximum number of rooms ({totalRoomsAllowed}) across all categories.
          </p>
        )}
      </div>
    </div>
  );
};

export default PerRoomPricingForm;
