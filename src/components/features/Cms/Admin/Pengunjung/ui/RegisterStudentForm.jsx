import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage
import { db, storage } from "@api/firebaseConfig";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const RegisterStudentForm = ({ onStudentAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    class: "",
    prifilImage: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // State untuk preview gambar
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    const getAdminId = async () => {
      try {
        const token = Cookies.get("token");
        if (token) {
          const decoded = jwtDecode(token);
          const userId = decoded.id;
          const q = query(collection(db, "admin"), where("userId", "==", userId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const adminDoc = querySnapshot.docs[0].data();
            setAdminId(adminDoc.id);
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Menampilkan preview gambar
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreview(fileReader.result); // Set gambar preview dari file yang dipilih
    };
    fileReader.readAsDataURL(selectedFile);
  };

  const generateUserId = async () => {
    const q = query(collection(db, "student"), orderBy("userId", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const lastStudent = querySnapshot.docs[0].data();
      const lastUserId = parseInt(lastStudent.userId, 10);
      return (lastUserId + 1).toString();
    } else {
      return "2415001";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!adminId) {
      alert("Admin ID tidak ditemukan.");
      return;
    }

    try {
      const newUserId = await generateUserId();
      let profileImageUrl = formData.prifilImage;

      // Jika ada file yang diupload, unggah ke Firebase Storage
      if (file) {
        const fileRef = ref(storage, `profileImages/${newUserId}_${file.name}`);
        await uploadBytes(fileRef, file);
        profileImageUrl = await getDownloadURL(fileRef); // Mendapatkan URL dari gambar yang diunggah
      }

      await addDoc(collection(db, "users"), {
        id: newUserId,
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: "student",
      });

      await addDoc(collection(db, "student"), {
        userId: newUserId,
        adminId: adminId,
        class: formData.class,
        prifilImage: profileImageUrl, // URL dari Firebase Storage atau yang dimasukkan secara manual
        lastBorrowedDate: null,
        status: "active",
      });

      setFormData({
        name: "",
        username: "",
        password: "",
        class: "",
        prifilImage: "",
      });
      setFile(null);
      setPreview(null); // Reset preview setelah form di-submit

      alert("Anggota perpustakaan berhasil didaftarkan!");

      if (onStudentAdded) {
        onStudentAdded();
      }
    } catch (error) {
      console.error("Error registering student:", error);
      alert("Terjadi kesalahan saat mendaftarkan anggota.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-center">
          Pendaftaran Anggota Perpustakaan
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Bagian Kiri: Form Input */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm bg-slate-50"
                placeholder="Masukkan nama anggota"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm bg-slate-50"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm bg-slate-50"
                placeholder="Masukkan password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kelas</label>
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm bg-slate-50"
                placeholder="Masukkan kelas"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button type="submit" className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600">
                Daftarkan Anggota
              </button>
            </div>
          </form>

          {/* Bagian Kanan: Upload Foto Profil */}
          <div className="flex flex-col items-center">
            {/* Gambar Default atau Preview */}
            <div className="mb-4">
              {preview ? (
                <img src={preview} alt="Preview" className="w-32 h-32 rounded-full object-cover" />
              ) : (
                <img src="https://static.vecteezy.com/system/resources/thumbnails/005/129/844/small_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg" alt="Default User" className="w-32 h-32 rounded-full" />
              )}
            </div>

            {/* Tombol Upload */}
            <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              Upload Foto
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudentForm;
