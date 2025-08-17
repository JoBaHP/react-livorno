import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { Eye, EyeOff, UtensilsCrossed } from "lucide-react";

export default function LoginView() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await login(username, password);
      if (result && result.user) {
        const dashboardPath =
          result.user.role === "admin" ? "/staff/admin" : "/staff/waiter";
        navigate(dashboardPath, { replace: true });
      } else {
        setError(result.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-slate-100">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-xl"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="bg-indigo-600 p-3 rounded-full mb-3">
              <UtensilsCrossed className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-center text-slate-800">
              Staff Panel Login
            </h2>
          </div>
          {error && (
            <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium">
              {error}
            </p>
          )}
          <div className="mb-4">
            <label
              className="block text-slate-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="mb-6 relative">
            <label
              className="block text-slate-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700"
              style={{ top: "2.1rem" }}
            >
              {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-indigo-400 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
