"use client";

import React, { useState, useContext, useEffect } from "react";
import { Context } from "../../_components/ContextProvider";
import { Trash2, Plus, X, Edit, Save } from "lucide-react";
import { site } from "../../_utils/request";

const facilityOptions = ["Geyser", "TV", "WiFi", "Breakfast", "Food"];

const PerRoomPricingForm = () => {
  const { hosthotel, user } = useContext(Context);
  const totalRoomsAllowed = hosthotel?.rooms || 0;
  const roomCategoriesFromServer = hosthotel?.room_cat || [];

  const [problems, setProblems] = useState({});
  const [categories, setCategories] = useState(() => {
    if (roomCategoriesFromServer.length > 0) {
      return roomCategoriesFromServer.map((cat) => ({
        roomData: {
          _id: cat._id,
          name: cat.name || "",
          room_no: cat.room_no && cat.room_no.length ? cat.room_no : [""],
          capacity: cat.capacity?.toString() || "",
          price: cat.price?.toString() || "",
          price_for_extra_person: cat.price_for_extra_person?.toString() || "",
          agent_com: {
            amount: cat.agent_com?.amount?.toString() || "",
            percent: cat.agent_com?.percent ?? true,
          },
          advance: {
            amount: cat.advance?.amount?.toString() || "",
            percent: cat.advance?.percent ?? true,
          },
          images: [],
          facilities: cat.amenities || [],
        },
        isEditing: false,
      }));
    } else {
      return [
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
      ];
    }
  });

  // Remove unnecessary useEffect — we no longer fetch anything

  const getTotalUsedRooms = () =>
    categories.reduce((total, cat) => total + cat.roomData.room_no.length, 0);

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
      {/* ...rest of the render logic remains unchanged */}
    </div>
  );
};

export default PerRoomPricingForm;
