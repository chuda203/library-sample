import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@api/firebaseConfig";  

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Query Firestore untuk mendapatkan user berdasarkan username dan password
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("username", "==", username),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const user = userDoc.data();

        // Simulasi JWT dengan base64 encode bagian header, payload, dan signature
        const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
        const payload = JSON.stringify({
          id: user.id,
          username: user.username,
          role: user.role,
        });

        // Base64 encoding header dan payload
        const base64Header = btoa(header);
        const base64Payload = btoa(payload);
        const fakeSignature = "fake-signature"; // Simulasi signature

        // Simpan token di cookie dalam format JWT-like
        const fakeToken = `${base64Header}.${base64Payload}.${fakeSignature}`;
        Cookies.set("token", fakeToken, { expires: 1 }); // Token berlaku 1 hari

        // Arahkan pengguna ke halaman yang sesuai berdasarkan role dan refresh halaman
        if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (user.role === "student") {
          navigate("/student", { replace: true });
        } else if (user.role === "headmaster") {
          navigate("/headmaster", { replace: true });
        } else {
          navigate("/guest", { replace: true });
        }

        // Refresh halaman setelah navigasi
        window.location.reload();
      } else {
        setError("Invalid username or password");
      }
    } catch (error) {
      setError("Something went wrong, please try again later");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Login</h2>
        <form onSubmit={handleLogin}>
          {/* Username Input */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-3 py-2 mt-1 bg-white border rounded-lg shadow-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full px-3 py-2 mt-1 bg-white border rounded-lg shadow-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-600 top-6"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          {/* Submit Button */}
          <div className="mb-6">
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
