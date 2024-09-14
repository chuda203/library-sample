import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@api/firebaseConfig"; // Firestore configuration
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import QRCode from "react-qr-code"; // Import QRCode

const ListPengembalian = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk kontrol modal
  const [selectedQRCode, setSelectedQRCode] = useState(null); // State untuk menyimpan QR code yang sedang diperbesar

  // Fetch data borrowing, student, dan user
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = Cookies.get("token");

        if (token) {
          const decoded = jwtDecode(token);
          const role = decoded.role;

          if (role === "admin") {
            const borrowingSnapshot = await getDocs(
              query(collection(db, "borrowing"), where("status", "==", "0"))
            );
            const borrowingData = borrowingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const studentSnapshot = await getDocs(collection(db, "student"));
            const studentData = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const userSnapshot = await getDocs(collection(db, "users"));
            const userData = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const studentDetails = borrowingData.map(borrow => {
              const student = studentData.find(student => student.userId === borrow.studentId);
              const user = userData.find(user => user.id === borrow.studentId);

              const formatTimestamp = (timestamp) => {
                if (!timestamp || !timestamp.seconds) return "Tanggal tidak valid";
                const date = new Date(timestamp.seconds * 1000);
                return date.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
              };

              return {
                ...student,
                borrowId: borrow.id,
                studentcode: student?.id,
                name: user?.name || "Nama tidak ditemukan",
                nomorHp: borrow.nomorHp,
                borrowedBookTitle: borrow.kodeBuku || "Buku tidak ditemukan",
                tanggalPeminjaman: formatTimestamp(borrow.tanggalPeminjaman),
                tanggalPengembalian: borrow.tanggalPengembalian,
                status: borrow.status,
              };
            });

            setStudents(studentDetails);
            setFilteredStudents(studentDetails);
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

  const handleStatusChange = async (borrowId, studentId, tanggalPengembalian) => {
    try {
      const borrowingDocRef = doc(db, "borrowing", borrowId);
      const currentDate = new Date(); 

      if (!tanggalPengembalian || !tanggalPengembalian.seconds) {
        alert("Tanggal pengembalian tidak valid atau tidak ditemukan.");
        return;
      }

      const pengembalianDate = new Date(tanggalPengembalian.seconds * 1000);
      let isLate = false;
      let banAdded = false;

      if (currentDate > pengembalianDate) {
        isLate = true;

        const studentQuery = query(collection(db, "student"), where("userId", "==", studentId));
        const studentSnapshot = await getDocs(studentQuery);

        if (studentSnapshot.empty) {
          alert(`Dokumen student tidak ditemukan untuk userId: ${studentId}`);
          return;
        }

        const studentDoc = studentSnapshot.docs[0]; 
        const studentData = studentDoc.data();

        const currentBanDate = studentData.ban?.seconds
          ? new Date(studentData.ban.seconds * 1000)
          : null;

        let newBanDate;
        if (currentBanDate && currentBanDate > currentDate) {
          newBanDate = new Date(currentBanDate.getTime() + 7 * 24 * 60 * 60 * 1000); 
        } else {
          newBanDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        }

        await updateDoc(studentDoc.ref, {
          ban: Timestamp.fromDate(newBanDate),
        });
        banAdded = true;
      }

      await updateDoc(borrowingDocRef, { status: "1" });

      const updatedStudents = students.map((student) => {
        if (student.borrowId === borrowId) {
          return { ...student, status: "1" };
        }
        return student;
      });

      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);

      if (isLate && banAdded) {
        alert("Buku telah dikembalikan. Namun, Anda terlambat mengembalikan buku. Anda tidak dapat meminjam buku selama 7 hari ke depan.");
      } else {
        alert("Buku telah dikembalikan.");
      }

    } catch (error) {
      alert(`Terjadi kesalahan saat memperbarui status pengembalian atau ban: ${error.message}`);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = students.filter((student) =>
      student.name.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  };

  const handleQRCodeClick = (studentcode) => {
    setSelectedQRCode(studentcode); // Set QR code yang dipilih
    setIsModalOpen(true); // Buka modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Tutup modal
    setSelectedQRCode(null); // Reset QR code yang dipilih
  };

  return (
    <div className="max-w-6xl min-h-screen p-6 mx-auto rounded-lg shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">Daftar Pengembalian Buku</h2>
      {error && <p className="text-red-500">{error}</p>}

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
              <th className="px-4 py-2 border-b">Nomor HP</th>
              <th className="px-4 py-2 border-b">Tanggal Peminjaman</th>
              <th className="px-4 py-2 border-b">Tanggal Pengembalian</th>
              <th className="px-4 py-2 border-b">Judul Buku</th>
              <th className="px-4 py-2 border-b">Pengembalian</th>
              <th className="px-4 py-2 border-b">QR Code</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-2 text-center border-b">{student.name}</td>
                  <td className="px-4 py-2 text-center border-b">{student.nomorHp}</td>
                  <td className="px-4 py-2 text-center border-b">{student.tanggalPeminjaman}</td>
                  <td className="px-4 py-2 text-center border-b">
                    {new Date(student.tanggalPengembalian.seconds * 1000).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2 text-center border-b">{student.borrowedBookTitle}</td>
                  <td className="px-4 py-2 text-center border-b">
                    <input
                      type="checkbox"
                      checked={student.status === "1"}
                      onChange={() => handleStatusChange(student.borrowId, student.userId, student.tanggalPengembalian)}
                      disabled={student.status === "1"}
                    />
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    <div
                      className="cursor-pointer"
                      onClick={() => handleQRCodeClick(student.studentcode)} // Saat QR code di klik, panggil fungsi ini
                    >
                      <QRCode value={student.studentcode} size={64} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-2 text-center border-b">
                  Tidak ada buku yang belum dikembalikan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal untuk menampilkan QR Code besar */}
      {isModalOpen && selectedQRCode && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <QRCode value={selectedQRCode} size={256} /> {/* QR Code ukuran besar */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
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

export default ListPengembalian;
