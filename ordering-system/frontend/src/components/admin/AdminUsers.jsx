import React, { useState } from "react";
import { useApi } from "../../ApiProvider";
import { Plus, Edit, Trash2 } from "lucide-react";
import ConfirmationModal from "../ConfirmationModal";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export default function AdminUsers() {
  const { t } = useTranslation();
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const api = useApi();
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getAllUsers(),
  });

  const saveUser = useMutation({
    mutationFn: (userData) =>
      userData.id
        ? api.updateUserPassword(userData.id, userData.password)
        : api.createUser(userData.username, userData.password, userData.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  const handleSave = async (userData) => {
    await saveUser.mutateAsync(userData);
    setEditingUser(null);
  };

  const deleteUser = useMutation({
    mutationFn: (userId) => api.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  const handleDelete = async (userId) => {
    await deleteUser.mutateAsync(userId);
    setDeletingUser(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{t('admin_users.title')}</h3>
        <button
          onClick={() =>
            setEditingUser({ username: "", password: "", role: "waiter" })
          }
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600"
        >
          <Plus size={18} />
          {t('admin_users.add_new')}
        </button>
      </div>
      {isLoading ? (
        <p>{t('admin_users.loading')}</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">{t('admin_users.username')}</th>
                <th className="p-3">{t('admin_users.role')}</th>
                <th className="p-3 text-center">{t('admin_users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <td className="p-3">{user.username}</td>
                  <td className="p-3 capitalize">{user.role}</td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => setEditingUser({ ...user, password: "" })}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                      title={t('admin_users.reset_password')}
                    >
                      <Edit size={18} />
                    </button>
                    {user.role !== "admin" && (
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title={t('admin_users.delete_user')}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editingUser && (
        <UserForm
          user={editingUser}
          onSave={handleSave}
          onCancel={() => setEditingUser(null)}
        />
      )}
      {deletingUser && (
        <ConfirmationModal
          title={t('admin_users.delete_title')}
          message={t('admin_users.delete_confirm', { username: deletingUser.username })}
          onConfirm={() => handleDelete(deletingUser.id)}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
}

function UserForm({ user, onSave, onCancel }) {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState(user.password);
  const [role, setRole] = useState(user.role);
  const isNewUser = !user.id;
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, username, password, role });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md"
      >
        <h3 className="text-xl font-bold mb-4">
          {isNewUser ? t('admin_users.form_add') : t('admin_users.form_reset_for', { username: user.username })}
        </h3>
        <div className="space-y-4">
          {isNewUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('admin_users.username')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">{isNewUser ? t('admin_users.temp_password') : t('admin_users.new_password')}</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          {isNewUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('admin_users.role')}</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="waiter">{t('admin_users.waiter')}</option>
                <option value="admin">{t('admin_users.admin')}</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300"
          >
            {t('admin_users.cancel')}
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700"
          >
            {t('admin_users.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
