import React, { useState, useEffect } from "react";
import { useApi } from "../../ApiProvider";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import ConfirmationModal from "../ConfirmationModal";

export default function AdminZones() {
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingZone, setEditingZone] = useState(null);
  const [deletingZone, setDeletingZone] = useState(null);
  const api = useApi();

  const fetchZones = () => {
    setIsLoading(true);
    api
      .getAllZones()
      .then(setZones)
      .finally(() => setIsLoading(false));
  };
  useEffect(fetchZones, [api]);

  const handleSave = async (zoneData) => {
    if (zoneData.id) {
      await api.updateZone(zoneData.id, zoneData);
    } else {
      await api.createZone(zoneData);
    }
    setEditingZone(null);
    fetchZones();
  };

  const handleDelete = async (id) => {
    await api.deleteZone(id);
    setDeletingZone(null);
    fetchZones();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Manage Delivery Zones</h3>
        <button
          onClick={() =>
            setEditingZone({
              name: "",
              delivery_fee: 0,
              center_lat: "",
              center_lng: "",
              radius_meters: 1000,
            })
          }
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600"
        >
          <Plus size={18} />
          Add New Zone
        </button>
      </div>
      {isLoading ? (
        <p>Loading zones...</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Zone Name</th>
                <th className="p-3">Delivery Fee</th>
                <th className="p-3">Radius (meters)</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr
                  key={zone.id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <td className="p-3">{zone.name}</td>
                  <td className="p-3">
                    ${parseFloat(zone.delivery_fee).toFixed(2)}
                  </td>
                  <td className="p-3">{zone.radius_meters}</td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => setEditingZone(zone)}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                      title="Edit Zone"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setDeletingZone(zone)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete Zone"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editingZone && (
        <ZoneForm
          zone={editingZone}
          onSave={handleSave}
          onCancel={() => setEditingZone(null)}
        />
      )}
      {deletingZone && (
        <ConfirmationModal
          title="Delete Zone"
          message={`Are you sure you want to delete the zone "${deletingZone.name}"?`}
          onConfirm={() => handleDelete(deletingZone.id)}
          onCancel={() => setDeletingZone(null)}
        />
      )}
    </div>
  );
}

function ZoneForm({ zone, onSave, onCancel }) {
  const [formData, setFormData] = useState(zone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MapPin /> {zone.id ? "Edit" : "Add"} Delivery Zone
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          You can use a tool like Google Maps to find the latitude and longitude
          of your zone's center.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Zone Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Delivery Fee ($)
              </label>
              <input
                type="number"
                step="0.01"
                name="delivery_fee"
                value={formData.delivery_fee}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Center Latitude
              </label>
              <input
                type="number"
                step="any"
                name="center_lat"
                value={formData.center_lat}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Center Longitude
              </label>
              <input
                type="number"
                step="any"
                name="center_lng"
                value={formData.center_lng}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Radius (in meters)
            </label>
            <input
              type="number"
              name="radius_meters"
              value={formData.radius_meters}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700"
          >
            Save Zone
          </button>
        </div>
      </form>
    </div>
  );
}
