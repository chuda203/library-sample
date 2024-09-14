import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@api/firebaseConfig"; // Firestore instance
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode

const ListTamu = () => {
  const [guests, setGuests] = useState([]);
  const [adminId, setAdminId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        // Ambil token dari cookie dan decode untuk mendapatkan user yang login
        const token = Cookies.get("token");
        const decodedToken = jwtDecode(token);
        const loggedInUserId = decodedToken.id;

        // Ambil data admin berdasarkan userId yang login dari Firestore
        const adminQuery = query(
          collection(db, "admin"),
          where("userId", "==", loggedInUserId)
        );
        const adminSnapshot = await getDocs(adminQuery);

        if (adminSnapshot.empty) {
          throw new Error("Admin not found");
        }

        const adminData = adminSnapshot.docs[0].data();
        const adminId = adminData.id; // Dapatkan adminId
        setAdminId(adminId);

        // Ambil data tamu dari Firestore
        const guestSnapshot = await getDocs(collection(db, "guest"));
        const guestData = guestSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Ambil data siswa dari Firestore
        const studentSnapshot = await getDocs(collection(db, "student"));
        const studentData = studentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Ambil data pengguna (users) dari Firestore
        const userSnapshot = await getDocs(collection(db, "users"));
        const userData = userSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          acc[data.id] = data; // Simpan data pengguna dengan id sebagai kunci
          return acc;
        }, {});

        // Memetakan data guest dengan nama student, kelas, dan adminId yang sesuai
        const guestsWithDetails = guestData
          .map((guest) => {
            // Temukan student berdasarkan studentId di tabel guest
            const student = studentData.find(
              (student) =>
                student.id === guest.studentId &&
                student.adminId === adminId
            );

            if (!student) return null;

            // Temukan user berdasarkan userId di tabel student
            const user = userData[student.userId];

            return {
              id: guest.id,
              name: user ? user.name : "Nama tidak ditemukan",
              class: student ? student.class : "Kelas tidak ditemukan",
              tanggalKunjungan: guest.tanggalKunjungan,
            };
          })
          .filter((guest) => guest !== null); // Hapus entri tamu yang tidak ada student-nya

        setGuests(guestsWithDetails);
      } catch (error) {
        setError("Error fetching guest data");
        console.error("Error fetching guest data:", error);
      }
    };

    fetchGuests();
  }, []);

  return (
    <div className="max-w-4xl min-h-screen p-6 mx-auto rounded-lg shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">Daftar Tamu Perpustakaan</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Nama</th>
              <th className="px-4 py-2 border-b">Kelas</th>
              <th className="px-4 py-2 border-b">Tanggal Kunjungan</th>
            </tr>
          </thead>
          <tbody>
            {guests.length > 0 ? (
              guests.map((guest) => (
                <tr key={guest.id}>
                  <td className="px-4 py-2 text-center border-b">
                    {guest.name}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {guest.class}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    {guest.tanggalKunjungan}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-4 py-2 text-center border-b">
                  Tidak ada tamu yang terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListTamu;
