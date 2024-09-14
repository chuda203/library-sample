import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@api/firebaseConfig"; // Firestore instance
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import QRCode from "react-qr-code"; // Import library QRCode

const ListPeminjaman = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [selectedStudentCode, setSelectedStudentCode] = useState(null); // State untuk QR code yang akan diperbesar

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Ambil token dari cookie
        const token = Cookies.get("token");
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        const role = decoded.role;

        if (role === "admin") {
          // Fetch data admin dari collection admin berdasarkan userId dari token
          const adminCollection = collection(db, "admin");
          const adminQuery = query(adminCollection, where("userId", "==", userId));
          const adminSnapshot = await getDocs(adminQuery);
          const adminData = adminSnapshot.docs.map(doc => doc.data())[0];

          if (!adminData) {
            throw new Error("Admin not found");
          }

          const adminId = adminData.id;

          // Fetch data borrowing
          const borrowingCollection = collection(db, "borrowing");
          const borrowingQuery = query(borrowingCollection);
          const borrowingSnapshot = await getDocs(borrowingQuery);
          const borrowingData = borrowingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Fetch data student berdasarkan adminId
          const studentCollection = collection(db, "student");
          const studentQuery = query(studentCollection, where("adminId", "==", adminId));
          const studentSnapshot = await getDocs(studentQuery);
          const studentData = studentSnapshot.docs.map(doc => ({
            id: doc.id, // ID dokumen yang disediakan oleh Firestore
            ...doc.data()
          }));

          // Fetch data books
          const booksCollection = collection(db, "books");
          const booksSnapshot = await getDocs(booksCollection);
          const booksData = booksSnapshot.docs.map(doc => doc.data());

          // Proses data siswa dan tambahkan jumlah buku yang dipinjam
          const studentDetails = await Promise.all(
            borrowingData.map(async (borrow) => {
              const student = studentData.find(student => student.userId === borrow.studentId);

              if (student) {
                // Find user details based on userId in student
                const userCollection = collection(db, "users");
                const userQuery = query(userCollection, where("id", "==", student.userId));
                const userSnapshot = await getDocs(userQuery);
                const userData = userSnapshot.docs.map(doc => doc.data())[0];

                // Find book details based on kodeBuku in borrowing
                const book = booksData.find(book => book.kodeBuku === borrow.kodeBuku);

                return {
                  ...student,
                  studentcode: student.id, // ID dokumen untuk QR code
                  name: userData ? userData.name : "Nama tidak ditemukan",
                  borrowedBookTitle: book ? book.title : "Buku tidak ditemukan",
                  nomorHp: borrow.nomorHp,
                  tanggalPeminjaman: borrow.tanggalPeminjaman,
                  tanggalPengembalian: borrow.tanggalPengembalian,
                  status: borrow.status,
                };
              }
              return null;
            })
          );

          // Filter out null values
          const filteredStudents = studentDetails.filter(student => student !== null);

          setStudents(filteredStudents);
          setFilteredStudents(filteredStudents); // Set initial filtered students
        } else {
          setError("You are not authorized to view this page.");
        }
      } catch (error) {
        setError("Error fetching students data");
        console.error("Error fetching students data:", error);
      }
    };

    fetchStudents();
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter daftar siswa berdasarkan query pencarian
    const filtered = students.filter((student) =>
      student.name.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  };

  // Function untuk membuka pop-up QR code besar
  const handleQRCodeClick = (studentcode) => {
    setSelectedStudentCode(studentcode);
  };

  // Function untuk menutup pop-up
  const handleCloseModal = () => {
    setSelectedStudentCode(null);
  };

  return (
    <div className="max-w-6xl min-h-screen p-6 mx-auto rounded-lg shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">Daftar Peminjaman Buku</h2>
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
              <th className="px-4 py-2 border-b">Status</th>
              <th className="px-4 py-2 border-b">QR Code</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-2 text-center border-b">
                    {student.name}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {student.class}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {student.nomorHp}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {student.tanggalPeminjaman}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {student.tanggalPengembalian}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {student.borrowedBookTitle}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {student.status === "1" ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-500" />
                    )}
                  </td>
                  {/* QR Code Column */}
                  <td className="px-4 py-2 text-center border-b">
                    <div
                      className="cursor-pointer"
                      onClick={() => handleQRCodeClick(student.studentcode)}
                    >
                      <QRCode value={student.studentcode} size={64} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-2 text-center border-b">
                  Tidak ada peminjaman buku.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal QR Code Besar */}
      {selectedStudentCode && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-center text-lg font-bold mb-4">QR Code</h3>
            <QRCode value={selectedStudentCode} size={256} />
            <div className="mt-4 text-center">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPeminjaman;
