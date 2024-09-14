import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@api/firebaseConfig"; // Firestore instance
import Cookies from "js-cookie"; // Untuk mengambil data dari token
import Select from "react-select"; // Untuk dropdown dengan fitur pencarian
import QRCode from "react-qr-code"; // Import QRCode dari react-qr-code

const PeminjamanForm = () => {
  const [formData, setFormData] = useState({
    id: "",
    nama: "",
    noTelepon: "",
    kodeBuku: "",
    judulBuku: "",
    tanggalPeminjaman: "",
    tanggalPengembalian: "",
  });

  const [bookOptions, setBookOptions] = useState([]); 
  const [studentcode, setStudentcode] = useState(""); 
  const [isBanned, setIsBanned] = useState(false);
  const [banDate, setBanDate] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksRef = collection(db, "books");
        const booksSnapshot = await getDocs(booksRef);

        const books = booksSnapshot.docs.map((doc) => ({
          value: doc.data().kodeBuku,
          label: doc.data().title,
        }));

        setBookOptions(books);
      } catch (error) {
        console.error("Error fetching books data:", error);
      }
    };

    const fetchUserData = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          const userId = decoded.id;

          const usersRef = collection(db, "users");
          const userQuery = query(usersRef, where("id", "==", userId));
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0].data();

            setFormData((prevData) => ({
              ...prevData,
              id: userId,
              nama: userDoc.name,
              noTelepon: userDoc.noTelepon || "",
            }));

            const studentsRef = collection(db, "student");
            const studentQuery = query(studentsRef, where("userId", "==", userId));
            const studentSnapshot = await getDocs(studentQuery);

            if (!studentSnapshot.empty) {
              const studentDoc = studentSnapshot.docs[0];
              setStudentcode(studentDoc.id);

              const studentData = studentDoc.data();
              const ban = studentData.ban?.seconds
                ? new Date(studentData.ban.seconds * 1000)
                : null;

              const currentDate = new Date();

              if (ban && ban > currentDate) {
                setIsBanned(true);
                setBanDate(ban);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchBooks();
    fetchUserData();

    const currentDate = new Date().toISOString().split("T")[0];
    setFormData((prevData) => ({
      ...prevData,
      tanggalPeminjaman: currentDate,
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBookChange = (selectedOption) => {
    setFormData({
      ...formData,
      kodeBuku: selectedOption.value,
      judulBuku: selectedOption.label,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const tanggalPeminjamanTimestamp = Timestamp.fromDate(new Date(formData.tanggalPeminjaman));
      const tanggalPengembalianTimestamp = Timestamp.fromDate(new Date(formData.tanggalPengembalian));

      const borrowingData = {
        studentId: formData.id,
        kodeBuku: formData.kodeBuku,
        tanggalPeminjaman: tanggalPeminjamanTimestamp,
        tanggalPengembalian: tanggalPengembalianTimestamp,
        nomorHp: formData.noTelepon,
        status: "0",
      };

      await addDoc(collection(db, "borrowing"), borrowingData);

      const studentsRef = collection(db, "student");
      const studentQuery = query(studentsRef, where("userId", "==", formData.id));
      const studentSnapshot = await getDocs(studentQuery);

      if (!studentSnapshot.empty) {
        const studentDoc = studentSnapshot.docs[0];
        const studentDocRef = doc(db, "student", studentDoc.id);

        await updateDoc(studentDocRef, {
          lastBorrowedDate: tanggalPeminjamanTimestamp,
        });

        console.log("Field lastBorrowedDate berhasil diupdate.");
      }

      setFormData({
        id: "",
        nama: "",
        noTelepon: "",
        kodeBuku: "",
        judulBuku: "",
        tanggalPeminjaman: "",
        tanggalPengembalian: "",
      });

      alert("Peminjaman berhasil disimpan!");
    } catch (error) {
      console.error("Error menyimpan peminjaman:", error);
      alert("Terjadi kesalahan saat menyimpan peminjaman.");
    }
  };

  if (isBanned) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Anda tidak dapat meminjam buku hingga {banDate.toLocaleDateString()}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-5xl p-6 bg-white rounded-lg shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-center">
          Peminjaman Buku Perpustakaan
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Bagian Kiri: Data Anggota dan QR Code */}
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <QRCode value={studentcode} size={128} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ID Anggota
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  No. Telepon
                </label>
                <input
                  type="text"
                  name="noTelepon"
                  value={formData.noTelepon}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Bagian Kanan: Data Buku dan Tanggal */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Judul Buku
                </label>
                <Select
                  options={bookOptions}
                  onChange={handleBookChange}
                  placeholder="Pilih Judul Buku"
                  className="mt-1 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kode Buku
                </label>
                <input
                  type="text"
                  name="kodeBuku"
                  value={formData.kodeBuku}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tanggal Peminjaman
                </label>
                <input
                  type="date"
                  name="tanggalPeminjaman"
                  value={formData.tanggalPeminjaman}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tanggal Pengembalian
                </label>
                <input
                  type="date"
                  name="tanggalPengembalian"
                  value={formData.tanggalPengembalian}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="button"
              className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
            >
              Submit Peminjaman
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PeminjamanForm;
