
          <div className="space-y-2">
            <label className="font-medium">Room Names</label>
            {cat.roomNumbers.map((r, rIdx) => (
              <div key={rIdx} className="flex gap-2">
                <input
                  value={r}
                  onChange={(e) => handleRoomNumberChange(catIdx, rIdx, e.target.value)}
                  className="border rounded p-2 w-full"
                  placeholder={`Room ${rIdx + 1}`}
                />
                {rIdx === cat.roomNumbers.length - 1 && (
                  <button onClick={() => addRoomNumber(catIdx)}><Plus /></button>
                )}
                {cat.roomNumbers.length > 1 && (
                  <button onClick={() => removeRoomNumber(catIdx, rIdx)}><X /></button>
                )}
              </div>
            ))}

            <input
              placeholder="Capacity"
              value={cat.capacity}
              onChange={(e) => handleChange(catIdx, "capacity", e.target.value)}
              className="border rounded p-2 w-full"
              type="number"
            />

            {[1, 2, 3, 4].map((num) => (
              <input
                key={num}
                placeholder={`Rate for ${num} person${num > 1 ? "s" : ""}`}
                type="number"
                value={cat[`rate${num}`]}
                onChange={(e) => handleChange(catIdx, `rate${num}`, e.target.value)}
                className="border rounded p-2 w-full"
              />
            ))}

            {/* Agent Commission */}
            <div className="flex gap-2">
              <input
                placeholder="Agent Commission"
                value={cat.agentCommission.amount}
                type="number"
                onChange={(e) => {
                  setCategories((p) => {
                    let copy = [...p];
                    copy[catIdx].agentCommission.amount = e.target.value;
                    return copy;
                  });
                }}
                className="border rounded p-2 w-full"
              />
              <select
                value={cat.agentCommission.percent ? "%" : "₹"}
                onChange={(e) => {
                  setCategories((p) => {
                    let copy = [...p];
                    copy[catIdx].agentCommission.percent = e.target.value === "%";
                    return copy;
                  });
                }}
                className="border rounded p-2"
              >
                <option value="%">%</option>
                <option value="₹">₹</option>
              </select>
            </div>

            {/* Advance */}
            <div className="flex gap-2">
              <input
                placeholder="Advance"
                type="number"
                value={cat.advance.amount}
                onChange={(e) => {
                  setCategories((p) => {
                    let copy = [...p];
                    copy[catIdx].advance.amount = e.target.value;
                    return copy;
                  });
                }}
                className="border rounded p-2 w-full"
              />
              <select
                value={cat.advance.percent ? "%" : "₹"}
                onChange={(e) => {
                  setCategories((p) => {
                    let copy = [...p];
                    copy[catIdx].advance.percent = e.target.value === "%";
                    return copy;
                  });
                }}
                className="border rounded p-2"
              >
                <option value="%">%</option>
                <option value="₹">₹</option>
              </select>
            </div>

            {/* Amenities Dropdown */}
            <div className="relative">
              <details className="mb-2">
                <summary className="cursor-pointer border px-3 py-2 rounded bg-white shadow text-gray-700">
                  Select Amenities
                </summary>
                <div className="border rounded shadow bg-white p-2 absolute z-10">
                  {availableAmenities.map((item) => (
                    <label key={item} className="block px-2 py-1">
                      <input
                        type="checkbox"
                        checked={cat.amenities.includes(item)}
                        onChange={() => {
                          setCategories((prev) => {
                            const updated = [...prev];
                            const selected = updated[catIdx].amenities;
                            updated[catIdx].amenities = selected.includes(item)
                              ? selected.filter((a) => a !== item)
                              : [...selected, item];
                            return updated;
                          });
                        }}
                      /> {item}
                    </label>
                  ))}
                </div>
              </details>
              <div className="text-sm text-gray-600">
                Selected: {cat.amenities.join(", ") || "None"}
              </div>
            </div>

            {/* Photo Upload */}
            {!cat._id && (
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleAddPhoto(catIdx, e.target.files)}
              />
            )}
            <div className="flex gap-2 flex-wrap">
              {cat.images.map((photo, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img
                    src={cat._id ? site + "imgs/" + photo : URL.createObjectURL(photo)}
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
          </div>
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