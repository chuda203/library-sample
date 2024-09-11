import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@api/firebaseConfig"; // Firestore instance
import { Bar } from "react-chartjs-2";
import "chart.js/auto"; // Ensure chart.js is auto-registered

const Laporan = () => {
  const [students, setStudents] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [returns, setReturns] = useState([]);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from Firestore
        const [studentSnapshot, borrowingSnapshot, bookSnapshot, userSnapshot] = await Promise.all([
          getDocs(collection(db, "student")),
          getDocs(collection(db, "borrowing")),
          getDocs(collection(db, "books")),
          getDocs(collection(db, "users"))
        ]);

        const studentData = studentSnapshot.docs.map(doc => doc.data());
        const borrowingData = borrowingSnapshot.docs.map(doc => doc.data());
        const bookData = bookSnapshot.docs.map(doc => doc.data());
        const userData = userSnapshot.docs.map(doc => doc.data());

        // Filter borrowing data based on status
        const borrowedBooks = borrowingData.filter(b => b.status === "0"); // Status 0 means not returned
        const returnedBooks = borrowingData.filter(b => b.status === "1"); // Status 1 means returned

        // Set state for books, borrowings, and returns
        setBooks(bookData);
        setBorrowings(borrowedBooks);
        setReturns(returnedBooks);

        // Map borrowing data to include student names and book titles
        const studentDetails = await Promise.all(
          borrowingData.map(async (borrow) => {
            const student = studentData.find(student => student.userId === borrow.studentId);
            const book = bookData.find(book => book.kodeBuku === borrow.kodeBuku);
            const user = userData.find(user => user.id === (student ? student.userId : null));

            return {
              ...student,
              name: user ? user.name : "Nama tidak ditemukan",
              borrowedBookTitle: book ? book.title : "Buku tidak ditemukan",
              nomorHp: borrow.nomorHp,
              tanggalPeminjaman: borrow.tanggalPeminjaman,
              tanggalPengembalian: borrow.tanggalPengembalian,
              status: borrow.status
            };
          })
        );

        setStudents(studentDetails);

      } catch (error) {
        setError("Error fetching data");
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics for chart data
  const chartData = {
    labels: ["Total Koleksi", "Buku Dipinjam", "Buku Dikembalikan"],
    datasets: [
      {
        label: "Statistik Perpustakaan",
        data: [books.length, borrowings.length, returns.length],
        backgroundColor: ["#3498db", "#e74c3c", "#2ecc71"],
        borderColor: ["#2980b9", "#c0392b", "#27ae60"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <h2 className="mb-6 text-3xl font-bold text-center">Laporan Perpustakaan</h2>

      {error && <p className="text-red-500">{error}</p>}

      {/* Section 1: Ringkasan Statistik */}
      <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <h3 className="text-xl font-bold">Total Koleksi Buku</h3>
          <p className="text-2xl font-semibold">{books.length}</p>
        </div>
        <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
          <h3 className="text-xl font-bold">Total Buku Dipinjam</h3>
          <p className="text-2xl font-semibold">{borrowings.length}</p>
        </div>
        <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
          <h3 className="text-xl font-bold">Total Buku Dikembalikan</h3>
          <p className="text-2xl font-semibold">{returns.length}</p>
        </div>
      </div>

      {/* Section 2: Grafik Statistik */}
      <div className="mb-8">
        <h3 className="mb-4 text-2xl font-bold text-center">Statistik Visual</h3>
        <Bar data={chartData} />
      </div>

      {/* Section 3: Laporan Detail Peminjaman */}
      <div className="mb-8">
        <h3 className="mb-4 text-2xl font-bold">Detail Peminjaman</h3>
        <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Nama Siswa</th>
              <th className="px-4 py-2 border-b">Kelas</th>
              <th className="px-4 py-2 border-b">Tanggal Peminjaman</th>
              <th className="px-4 py-2 border-b">Judul Buku</th>
              <th className="px-4 py-2 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {borrowings.map((borrow) => {
              const student = students.find((s) => s.userId === borrow.studentId);
              const book = books.find((b) => b.kodeBuku === borrow.kodeBuku);
              return (
                <tr key={borrow.id}>
                  <td className="px-4 py-2 text-center border-b">
                    {student?.name || "Tidak Ditemukan"}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {student?.class || "Tidak Ditemukan"}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {borrow.tanggalPeminjaman}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {book?.title || "Tidak Ditemukan"}
                  </td>
                  <td className="px-4 py-2 text-center text-red-500 border-b">
                    Dipinjam
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section 4: Laporan Detail Pengembalian */}
      <div className="mb-8">
        <h3 className="mb-4 text-2xl font-bold">Detail Pengembalian</h3>
        <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Nama Siswa</th>
              <th className="px-4 py-2 border-b">Kelas</th>
              <th className="px-4 py-2 border-b">Tanggal Pengembalian</th>
              <th className="px-4 py-2 border-b">Judul Buku</th>
              <th className="px-4 py-2 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((ret) => {
              const student = students.find((s) => s.userId === ret.studentId);
              const book = books.find((b) => b.kodeBuku === ret.kodeBuku);
              return (
                <tr key={ret.id}>
                  <td className="px-4 py-2 text-center border-b">
                    {student?.name || "Tidak Ditemukan"}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {student?.class || "Tidak Ditemukan"}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {ret.tanggalPengembalian}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {book?.title || "Tidak Ditemukan"}
                  </td>
                  <td className="px-4 py-2 text-center text-green-500 border-b">
                    Dikembalikan
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section 5: Laporan Koleksi Buku */}
      <div>
        <h3 className="mb-4 text-2xl font-bold">Daftar Koleksi Buku</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {books.map((book) => (
            <div
              key={book.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-md"
            >
              <h4 className="mb-2 text-xl font-bold">{book.title}</h4>
              <p className="mb-1 text-gray-600">
                <span className="font-semibold">Kode Buku:</span>{" "}
                {book.kodeBuku}
              </p>
              <p className="mb-1 text-gray-600">
                <span className="font-semibold">Pengarang:</span> {book.author}
              </p>
              <p className="mb-1 text-gray-600">
                <span className="font-semibold">Jumlah:</span> {book.jumlahBuku}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Laporan;
