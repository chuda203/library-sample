import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@api/firebaseConfig"; // Firebase Firestore configuration
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // Pastikan Anda memiliki library ini

const RegisterStudentForm = ({ onStudentAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    class: "",
    prifilImage: "",
  });
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    const getAdminId = async () => {
      try {
        // Ambil token dari cookie
        const token = Cookies.get("token");

        if (token) {
          // Decode token untuk mendapatkan userId dari admin yang login
          const decoded = jwtDecode(token);
          const userId = decoded.id;

          // Cari admin berdasarkan userId di collection 'admin'
          const q = query(collection(db, "admin"), where("userId", "==", userId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const adminDoc = querySnapshot.docs[0].data(); // Ambil data dari dokumen pertama yang ditemukan
            setAdminId(adminDoc.id); // Ambil field 'id' dari dokumen admin
          } else {
            console.error("Admin tidak ditemukan.");
          }
        } else {
          console.error("Token tidak ditemukan.");
        }
      } catch (error) {
        console.error("Error getting admin ID:", error);
      }
    };

    getAdminId();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const generateUserId = async () => {
    const q = query(collection(db, "student"), orderBy("userId", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const lastStudent = querySnapshot.docs[0].data();
      const lastUserId = parseInt(lastStudent.userId, 10); // Ambil userId terakhir dan konversi ke integer
      return (lastUserId + 1).toString(); // Tambahkan 1 untuk userId berikutnya
    } else {
      return "2415001"; // Jika belum ada userId, mulai dari 2415001
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!adminId) {
      alert("Admin ID tidak ditemukan.");
      return;
    }

    try {
      // Generate `userId` baru dengan format `241500x` dari koleksi `student`
      const newUserId = await generateUserId();

      // Tambahkan ke koleksi `users` di Firestore dengan `id` baru
      await addDoc(collection(db, "users"), {
        id: newUserId, // Gunakan userId baru, sebagai id di users
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: "student", // Selalu student
      });

      // Tambahkan ke koleksi `student` di Firestore dengan `userId` dari `users` dan `adminId`
      await addDoc(collection(db, "student"), {
        userId: newUserId, // Terhubung ke id dari users collection
        adminId: adminId, // Ambil adminId dari field 'id' di admin yang login
        class: formData.class,
        prifilImage: formData.prifilImage,
        lastBorrowedDate: null, // Baru mendaftar, jadi belum ada buku yang dipinjam
        status: "active", // Status aktif untuk anggota yang baru didaftarkan
      });

      // Reset form setelah submit
      setFormData({
        name: "",
        username: "",
        password: "",
        class: "",
        prifilImage: "",
      });

      alert("Anggota perpustakaan berhasil didaftarkan!");

      // Panggil callback onStudentAdded setelah berhasil menambahkan anggota
      if (onStudentAdded) {
        onStudentAdded();
      }
    } catch (error) {
      console.error("Error registering student:", error);
      alert("Terjadi kesalahan saat mendaftarkan anggota.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-center">
          Pendaftaran Anggota Perpustakaan
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan nama anggota"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan password"
              required
            />
          </div>

          {/* Kelas */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Kelas</label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan kelas"
              required
            />
          </div>

          {/* URL Foto Profil */}
          <div>
            <label className="block text-sm font-medium text-gray-700">URL Foto Profil</label>
            <input
              type="text"
              name="prifilImage"
              value={formData.prifilImage}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan URL foto profil"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
            >
              Daftarkan Anggota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterStudentForm;
