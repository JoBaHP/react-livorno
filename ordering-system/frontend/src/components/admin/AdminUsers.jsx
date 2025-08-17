import React, { useState, useEffect } from "react";
import { useApi } from "../../ApiProvider";
import { Plus, Edit, Trash2 } from "lucide-react";
import ConfirmationModal from "../ConfirmationModal";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const api = useApi();

  const fetchUsers = () => {
    setIsLoading(true);
    api
      .getAllUsers()
      .then(setUsers)
      .finally(() => setIsLoading(false));
  };
  useEffect(fetchUsers, [api]);

  const handleSave = async (userData) => {
    if (userData.id) {
      // This is for updating password
      await api.updateUserPassword(userData.id, userData.password);
    } else {
      // This is for creating a new user
      await api.createUser(userData.username, userData.password, userData.role);
    }
    setEditingUser(null);
    fetchUsers();
  };

  const handleDelete = async (userId) => {
    await api.deleteUser(userId);
    setDeletingUser(null);
    fetchUsers();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Manage Users</h3>
        <button
          onClick={() =>
            setEditingUser({ username: "", password: "", role: "waiter" })
          }
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600"
        >
          <Plus size={18} />
          Add New User
        </button>
      </div>
      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-center">Actions</th>
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
                      title="Reset Password"
                    >
                      <Edit size={18} />
                    </button>
                    {user.role !== "admin" && (
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete User"
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
          title="Delete User"
          message={`Are you sure you want to delete the user "${deletingUser.username}"?`}
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
          {isNewUser ? "Add New User" : `Reset Password for ${user.username}`}
        </h3>
        <div className="space-y-4">
          {isNewUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
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
            <label className="block text-sm font-medium text-gray-700">
              {isNewUser ? "Temporary Password" : "New Password"}
            </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="waiter">Waiter</option>
                <option value="admin">Admin</option>
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
