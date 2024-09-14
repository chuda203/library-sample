import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import { db, storage } from "@api/firebaseConfig"; 

const ListKoleksiBuku = () => {
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    kodeBuku: "",
    title: "",
    jenis: "",
    isbn: "",
    author: "",
    publisher: "",
    publishedYear: "",
    jumlahBuku: "",
    cover: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); 

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksCollection = collection(db, "books");
        const booksSnapshot = await getDocs(booksCollection);
        const booksList = booksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(booksList);
      } catch (error) {
        console.error("Error fetching books data:", error);
      }
    };

    fetchBooks();
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreview(fileReader.result); 
    };
    fileReader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let coverUrl = newBook.cover;

      if (file) {
        const fileRef = ref(storage, `bookCovers/${newBook.kodeBuku}_${file.name}`);
        await uploadBytes(fileRef, file);
        coverUrl = await getDownloadURL(fileRef); 
      }

      const booksCollection = collection(db, "books");
      await addDoc(booksCollection, { ...newBook, cover: coverUrl });

      const booksSnapshot = await getDocs(booksCollection);
      const booksList = booksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBooks(booksList);
      setNewBook({
        kodeBuku: "",
        title: "",
        jenis: "",
        isbn: "",
        author: "",
        publisher: "",
        publishedYear: "",
        jumlahBuku: "",
        cover: "",
      });
      setFile(null);
      setPreview(null);
      toggleModal();
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <h2 className="mb-6 text-3xl font-bold text-center">
        Daftar Buku Perpustakaan
      </h2>

      {/* Button to open modal */}
      <div className="mb-4 text-right">
        <button
          onClick={toggleModal}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Tambah Buku
        </button>
      </div>

      {/* Modal for adding new book */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="mb-4 text-2xl font-bold">Tambah Buku Baru</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Bagian Kiri: Input Data Buku */}
                <div>
                  <div>
                    <label className="block mb-2 font-semibold">Kode Buku</label>
                    <input
                      type="text"
                      name="kodeBuku"
                      value={newBook.kodeBuku}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg border-gray-300 bg-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Judul Buku</label>
                    <input
                      type="text"
                      name="title"
                      value={newBook.title}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg border-gray-300 bg-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Jenis</label>
                    <input
                      type="text"
                      name="jenis"
                      value={newBook.jenis}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg border-gray-300 bg-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">ISBN</label>
                    <input
                      type="text"
                      name="isbn"
                      value={newBook.isbn}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg border-gray-300 bg-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Pengarang</label>
                    <input
                      type="text"
                      name="author"
                      value={newBook.author}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg border-gray-300 bg-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Penerbit</label>
                    <input
                      type="text"
                      name="publisher"
                      value={newBook.publisher}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg border-gray-300 bg-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Tahun Terbit</label>
                    <input
                      type="number"
                      name="publishedYear"
                      value={newBook.publishedYear}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg border-gray-300 bg-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Jumlah Buku</label>
                    <input
                      type="number"
                      name="jumlahBuku"
                      value={newBook.jumlahBuku}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg border-gray-300 bg-slate-100"
                      required
                    />
                  </div>
                </div>

                {/* Bagian Kanan: Upload Cover Buku dan Preview */}
                <div className="flex flex-col items-center">
                  <div className="mb-4">
                    {preview ? (
                      <img src={preview} alt="Preview Cover" className="w-32 h-32 object-cover" />
                    ) : (
                      <img src="/default-cover.png" alt="Default Cover" className="w-32 h-32 object-cover" />
                    )}
                  </div>

                  <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Upload Cover
                    <input type="file" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-4">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                >
                  Tambah Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Collection */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {books.map((book) => (
          <div
            key={book.id}
            className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md"
          >
            {/* Cover Buku */}
            <img
              src={book.cover}
              alt={book.title}
              className="object-cover w-full h-48"
            />
            {/* Konten Card */}
            <div className="p-4 bg-blue-50">
              <h3 className="mb-2 text-xl font-bold text-gray-800">
                {book.title}
              </h3>
              <p className="mb-1 text-gray-600">
                <span className="font-semibold">Kode Buku:</span>{" "}
                {book.kodeBuku}
              </p>
              <p className="mb-1 text-gray-600">
                <span className="font-semibold">Jenis:</span> {book.jenis}
              </p>
              <p className="mb-1 text-gray-600">
                <span className="font-semibold">ISBN:</span> {book.isbn}
              </p>
              <p className="mb-1 text-gray-600">
                <span className="font-semibold">Pengarang:</span> {book.author}
              </p>
              <p className="mb-1 text-gray-600">
                <span className="font-semibold">Penerbit:</span>{" "}
                {book.publisher}
              </p>
              <p className="mb-1 text-gray-600">
                <span className="font-semibold">Tahun Terbit:</span>{" "}
                {book.publishedYear}
              </p>
              <p className="mb-1 text-gray-600">
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

export default ListKoleksiBuku;
