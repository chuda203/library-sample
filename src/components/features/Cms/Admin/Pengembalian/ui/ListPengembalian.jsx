import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@api/firebaseConfig"; // Firestore configuration
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const ListPengembalian = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Ambil token dari cookie
        const token = Cookies.get("token");

        if (token) {
          // Decode token untuk mendapatkan informasi user
          const decoded = jwtDecode(token);
          const role = decoded.role;

          // Cek apakah role adalah admin
          if (role === "admin") {
            // Ambil data peminjaman dari Firestore (borrowing dengan status 0 berarti belum dikembalikan)
            const borrowingSnapshot = await getDocs(
              query(collection(db, "borrowing"), where("status", "==", "0"))
            );
            const borrowingData = borrowingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Ambil data student dari Firestore
            const studentSnapshot = await getDocs(collection(db, "student"));
            const studentData = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Ambil data users dari Firestore untuk nama siswa
            const userSnapshot = await getDocs(collection(db, "users"));
            const userData = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Ambil data buku dari Firestore untuk judul buku
            const bookSnapshot = await getDocs(collection(db, "books"));
            const bookData = bookSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Filter dan gabungkan data borrowing, student, dan users
            const studentDetails = borrowingData.map(borrow => {
              // Cari student berdasarkan userId, bukan student.id
              const student = studentData.find(student => student.userId === borrow.studentId);
              const user = userData.find(user => user.id === student?.userId);
              const book = bookData.find(book => book.kodeBuku === borrow.kodeBuku);

              return {
                ...student,
                borrowId: borrow.id, // Tambahkan ID borrowing untuk update status
                name: user ? user.name : "Nama tidak ditemukan",
                borrowedBookTitle: book ? book.title : "Buku tidak ditemukan",
                nomorHp: borrow.nomorHp,
                tanggalPeminjaman: borrow.tanggalPeminjaman,
                tanggalPengembalian: borrow.tanggalPengembalian,
                status: borrow.status, // Status pengembalian buku
                prifilImage: student?.prifilImage || "", // Gambar profil jika ada
              };
            });

            setStudents(studentDetails);
            setFilteredStudents(studentDetails); // Set initial filtered students
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

    fetchStudents();
  }, []);

  // Fungsi untuk update status pengembalian di Firestore
  const handleStatusChange = async (borrowId) => {
    try {
      const borrowingDocRef = doc(db, "borrowing", borrowId);
      // Update status peminjaman di Firestore menjadi 1 (dikembalikan)
      await updateDoc(borrowingDocRef, {
        status: "1",
      });

      // Perbarui data lokal setelah perubahan status
      const updatedStudents = students.map((student) => {
        if (student.borrowId === borrowId) {
          return { ...student, status: "1" }; // Update status menjadi true
        }
        return student;
      });

      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
    } catch (error) {
      console.error("Error updating borrow status:", error);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter daftar siswa berdasarkan query pencarian
    const filtered = students.filter((student) =>
      student.name.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  };

  return (
    <div className="max-w-6xl min-h-screen p-6 mx-auto rounded-lg shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">Daftar Pengembalian Buku</h2>
      {error && <p className="text-red-500">{error}</p>}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Nama</th>
              <th className="px-4 py-2 border-b">Kelas</th>
              <th className="px-4 py-2 border-b">Nomor HP</th>
              <th className="px-4 py-2 border-b">Tanggal Peminjaman</th>
              <th className="px-4 py-2 border-b">Tanggal Pengembalian</th>
              <th className="px-4 py-2 border-b">Judul Buku</th>
              <th className="px-4 py-2 border-b">Pengembalian</th>
              <th className="px-4 py-2 border-b">Foto</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-2 text-center border-b">{student.name}</td>
                  <td className="px-4 py-2 text-center border-b">{student.class}</td>
                  <td className="px-4 py-2 text-center border-b">{student.nomorHp}</td>
                  <td className="px-4 py-2 text-center border-b">{student.tanggalPeminjaman}</td>
                  <td className="px-4 py-2 text-center border-b">{student.tanggalPengembalian}</td>
                  <td className="px-4 py-2 text-center border-b">{student.borrowedBookTitle}</td>
                  <td className="px-4 py-2 text-center border-b">
                    <input
                      type="checkbox"
                      checked={student.status === "1"}
                      onChange={() => handleStatusChange(student.borrowId)}
                      disabled={student.status === "1"}
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <img
                      src={student.prifilImage}
                      alt={student.name}
                      className="object-cover w-12 h-12 mx-auto rounded-full"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-2 text-center border-b">
                  Tidak ada buku yang belum dikembalikan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListPengembalian;
