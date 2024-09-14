import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@api/firebaseConfig"; // Mengimpor Firestore instance
import Cookies from "js-cookie"; // Untuk mengambil data dari token
import Select from "react-select"; // Untuk dropdown dengan fitur pencarian

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

  const [bookOptions, setBookOptions] = useState([]); // State untuk menyimpan daftar buku

  useEffect(() => {
    // Fetch daftar buku dari Firestore
    const fetchBooks = async () => {
      try {
        const booksRef = collection(db, "books");
        const booksSnapshot = await getDocs(booksRef);

        // Mapping data buku menjadi option untuk react-select
        const books = booksSnapshot.docs.map((doc) => ({
          value: doc.data().kodeBuku, // Kode buku sebagai value
          label: doc.data().title, // Judul buku sebagai label
        }));

        setBookOptions(books);
      } catch (error) {
        console.error("Error fetching books data:", error);
      }
    };

    // Fetch data user dari cookie token dan populate ke form
    const fetchUserData = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          // Decode token untuk mendapatkan ID user
          const decoded = JSON.parse(atob(token.split(".")[1])); // Mengambil payload dari token
          const userId = decoded.id;

          // Query Firestore untuk mendapatkan data user
          const usersRef = collection(db, "users");
          const userQuery = query(usersRef, where("id", "==", userId));
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0].data();

            // Isi nama dan nomor telepon dari user yang login
            setFormData((prevData) => ({
              ...prevData,
              id: userId,
              nama: userDoc.name, // Mengisi nama otomatis
              noTelepon: userDoc.noTelepon || "", // Nomor telepon, jika ada
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchBooks();
    fetchUserData();

    // Mengisi tanggal peminjaman dengan tanggal saat ini
    const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
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
      kodeBuku: selectedOption.value, // Isi kode buku dari value yang dipilih
      judulBuku: selectedOption.label, // Isi judul buku dari label yang dipilih
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Lakukan POST request ke Firestore untuk menyimpan data peminjaman
      const borrowingData = {
        studentId: formData.id, // ID User yang melakukan peminjaman
        kodeBuku: formData.kodeBuku, // Kode Buku yang dipinjam
        tanggalPeminjaman: formData.tanggalPeminjaman,
        tanggalPengembalian: formData.tanggalPengembalian,
        nomorHp: formData.noTelepon, // Nomor telepon peminjam
        status: "0", // Status set ke 0 (belum dikembalikan)
      };

      // Menambahkan data peminjaman ke collection borrowing
      await addDoc(collection(db, "borrowing"), borrowingData);

      // Setelah berhasil menyimpan peminjaman, update lastBorrowedDate di student
      const studentsRef = collection(db, "student");
      const studentQuery = query(studentsRef, where("userId", "==", formData.id));
      const studentSnapshot = await getDocs(studentQuery);

      if (!studentSnapshot.empty) {
        const studentDoc = studentSnapshot.docs[0];
        const studentDocRef = doc(db, "student", studentDoc.id);

        // Update lastBorrowedDate di document student
        await updateDoc(studentDocRef, {
          lastBorrowedDate: formData.tanggalPeminjaman,
        });

        console.log("Field lastBorrowedDate berhasil diupdate.");
      }

      console.log("Data peminjaman berhasil disimpan:", borrowingData);

      // Reset form setelah submit
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

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-4xl p-6 rounded-lg shadow-lg bg-slate-100">
        <h2 className="mb-6 text-2xl font-bold text-center">
          Peminjaman Buku Perpustakaan
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informasi Anggota */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID Anggota
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan ID Anggota"
                readOnly // Tidak bisa diubah, karena otomatis diambil dari token
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
                className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama Otomatis Terisi"
                readOnly // Kolom ini hanya baca saja
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
                className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan No. Telepon"
                required
              />
            </div>
          </div>

          {/* Informasi Buku */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Judul Buku
              </label>
              <Select
                options={bookOptions}
                onChange={handleBookChange}
                placeholder="Pilih Judul Buku"
                className="mt-1 text-slate-900"
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
                className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kode Buku Otomatis Terisi"
                readOnly // Kolom ini hanya baca saja
              />
            </div>
          </div>

          {/* Tanggal Peminjaman dan Pengembalian */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Peminjaman
              </label>
              <input
                type="date"
                name="tanggalPeminjaman"
                value={formData.tanggalPeminjaman}
                onChange={handleInputChange}
                className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                readOnly // Tanggal ini otomatis diisi dengan tanggal saat ini
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
                className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
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
