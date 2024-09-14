import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@api/firebaseConfig"; // Mengimpor Firestore instance

const DataBuku = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Fungsi untuk mengambil data buku dari Firestore
    const fetchBooks = async () => {
      try {
        // Ambil koleksi buku dari Firestore
        const booksRef = collection(db, "books");
        const querySnapshot = await getDocs(booksRef);

        // Mengonversi hasil query ke array
        const booksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching books data:", error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">
        Daftar Buku Perpustakaan
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
          >
            {/* Cover Buku */}
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-48 object-cover"
            />
            {/* Konten Card */}
            <div className="p-4 bg-blue-50">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {book.title}
              </h3>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Kode Buku:</span>{" "}
                {book.kodeBuku}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Jenis:</span> {book.jenis}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">ISBN:</span> {book.isbn}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Pengarang:</span> {book.author}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Penerbit:</span>{" "}
                {book.publisher}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Tahun Terbit:</span>{" "}
                {book.publishedYear}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Jumlah Buku:</span>{" "}
                {book.jumlahBuku}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataBuku;
