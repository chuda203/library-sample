import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@api/firebaseConfig"; // Firestore instance
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode
import { FaPlus } from "react-icons/fa"; // Icon tambah anggota
import RegisterStudentForm from "../../Pengunjung/ui/RegisterStudentForm"; // Import form pendaftaran

const ListAnggota = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false); // State untuk mengontrol visibilitas form

  useEffect(() => {
    fetchStudents(); // Panggil fetchStudents saat pertama kali halaman dirender
  }, []);

  const fetchStudents = async () => {
    try {
      // Ambil token dari cookie
      const token = Cookies.get("token");

      if (token) {
        // Decode token untuk mendapatkan informasi user
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        const role = decoded.role;

        // Cek apakah role adalah admin
        if (role === "admin") {
          // Ambil data admin berdasarkan userId dari Firestore
          const adminQuery = query(
            collection(db, "admin"),
            where("userId", "==", userId)
          );
          const adminSnapshot = await getDocs(adminQuery);

          if (adminSnapshot.empty) {
            throw new Error("Admin not found");
          }

          const adminData = adminSnapshot.docs[0].data();
          const adminId = adminData.id; // Dapatkan adminId

          // Ambil data siswa berdasarkan adminId dari Firestore
          const studentQuery = query(
            collection(db, "student"),
            where("adminId", "==", adminId)
          );
          const studentSnapshot = await getDocs(studentQuery);
          const studentData = studentSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Ambil data pengguna (users) dari Firestore
          const usersSnapshot = await getDocs(collection(db, "users"));
          const usersData = usersSnapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            acc[data.id] = data; // Simpan data pengguna dengan id sebagai kunci
            return acc;
          }, {});

          // Proses data siswa dengan menghubungkan ke data `users`
          const studentDetails = studentData.map((student) => ({
            ...student,
            name: usersData[student.userId]?.name || "Tidak Ditemukan", // Ambil nama dari users table berdasarkan userId
          }));

          setStudents(studentDetails);
        } else {
          setError("You are not authorized to view this page.");
        }
      } else {
        setError("Token not found");
      }
    } catch (error) {
      setError("Error fetching students data");
      console.error("Error fetching students data:", error);
    }
  };

  const handleNewStudentAdded = () => {
    // Setelah anggota baru ditambahkan, panggil fetchStudents untuk memperbarui daftar
    fetchStudents();
  };

  return (
    <div className="max-w-4xl min-h-screen p-6 mx-auto rounded-lg shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">Daftar Anggota</h2>
      {error && <p className="text-red-500">{error}</p>}
      
      {/* Tombol tambah anggota */}
      <button
        onClick={() => setIsFormVisible(true)} // Tampilkan form saat tombol diklik
        className="flex items-center px-4 py-2 mb-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
      >
        <FaPlus className="mr-2" /> Tambah Anggota
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Nama</th>
              <th className="px-4 py-2 border-b">Kelas</th>
              <th className="px-4 py-2 border-b">Foto</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-4 py-2 text-center border-b">{student.name}</td>
                <td className="px-4 py-2 text-center border-b">{student.class}</td>
                <td className="px-4 py-2 border-b">
                  <img
                    src={student.prifilImage}
                    alt={student.name}
                    className="object-cover w-12 h-12 mx-auto rounded-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal untuk Form Tambah Anggota */}
      {isFormVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg">
            <button
              onClick={() => setIsFormVisible(false)} // Tutup form
              className="float-right p-2 text-xl text-gray-600"
            >
              &times;
            </button>
            <RegisterStudentForm onStudentAdded={handleNewStudentAdded} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ListAnggota;
