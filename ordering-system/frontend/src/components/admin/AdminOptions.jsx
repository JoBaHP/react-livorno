import React, { useState } from "react";
import { formatCurrency } from '../../utils/format';
import { useApi } from "../../ApiProvider";
import { Plus, Edit, Trash2 } from "lucide-react";
import ConfirmationModal from "../ConfirmationModal";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export default function AdminOptions() {
  const { t } = useTranslation();
  const [editingOption, setEditingOption] = useState(null);
  const [deletingOption, setDeletingOption] = useState(null);
  const api = useApi();
  const queryClient = useQueryClient();
  const { data: options = [], isLoading, error } = useQuery({
    queryKey: ['options'],
    queryFn: () => api.getAllOptions().then((d) => (Array.isArray(d) ? d : [])),
  });

  const saveOption = useMutation({
    mutationFn: (optionData) =>
      optionData.id
        ? api.updateOption(optionData.id, optionData.name, optionData.price)
        : api.createOption(optionData.name, optionData.price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['options'] });
    },
  });
  const handleSave = async (optionData) => {
    await saveOption.mutateAsync(optionData);
    setEditingOption(null);
  };

  const deleteOption = useMutation({
    mutationFn: (id) => api.deleteOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['options'] });
    },
  });
  const handleDelete = async (id) => {
    await deleteOption.mutateAsync(id);
    setDeletingOption(null);
  };

  const chargeableOptions = options.filter((opt) => parseFloat(opt.price) > 0);
  const freeOptions = options.filter((opt) => parseFloat(opt.price) === 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{t('admin_options.title')}</h3>
        <button
          onClick={() => setEditingOption({ name: "", price: 0 })}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600"
        >
          <Plus size={18} />
          {t('admin_options.add_new')}
        </button>
      </div>

      {isLoading && <p>{t('admin_options.loading')}</p>}
      {error && <p className="text-red-500">{t('admin_options.fetch_error')}</p>}

      <div className="space-y-8">
        <OptionsTable
          title={t('admin_options.chargeable')}
          options={chargeableOptions}
          onEdit={setEditingOption}
          onDelete={setDeletingOption}
        />
        <OptionsTable
          title={t('admin_options.free_addons')}
          options={freeOptions}
          onEdit={setEditingOption}
          onDelete={setDeletingOption}
        />
      </div>

      {editingOption && (
        <OptionForm
          option={editingOption}
          onSave={handleSave}
          onCancel={() => setEditingOption(null)}
        />
      )}
      {deletingOption && (
        <ConfirmationModal
          title={t('admin_options.delete_title')}
          message={t('admin_options.delete_confirm', { name: deletingOption.name })}
          onConfirm={() => handleDelete(deletingOption.id)}
          onCancel={() => setDeletingOption(null)}
        />
      )}
    </div>
  );
}

function OptionsTable({ title, options, onEdit, onDelete }) {
  const { t } = useTranslation();
  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">{t('admin_options.name')}</th>
              <th className="p-3">{t('admin_options.price')}</th>
              <th className="p-3 text-center">{t('admin_options.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {options.map((opt) => (
              <tr
                key={opt.id}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                <td className="p-3">{opt.name}</td>
                <td className="p-3">{formatCurrency(parseFloat(opt.price))}</td>
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => onEdit(opt)}
                    className="text-indigo-600 hover:text-indigo-800 p-1"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(opt)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OptionForm({ option, onSave, onCancel }) {
  const [name, setName] = useState(option.name);
  const [price, setPrice] = useState(option.price);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...option, name, price });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md"
      >
        <h3 className="text-xl font-bold mb-4">
          {option.id ? "Edit" : "Add"} Option
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Option Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price (0 for free)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
