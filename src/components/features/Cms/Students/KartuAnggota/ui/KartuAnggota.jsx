import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@api/firebaseConfig"; // Mengimpor Firestore instance
import Cookies from "js-cookie";

const KartuAnggota = () => {
  const [studentData, setStudentData] = useState({
    name: "",
    className: "",
    memberId: "",
    profilImage: "",
  });

  useEffect(() => {
    // Ambil token dari cookie
    const token = Cookies.get("token");

    if (token) {
      try {
        // Decode token untuk mendapatkan payload
        const base64Payload = token.split(".")[1];
        const payload = JSON.parse(atob(base64Payload));
        const userId = payload.id;

        // Fetch data siswa berdasarkan ID dari token
        const fetchStudentData = async () => {
          try {
            // Query Firestore untuk mendapatkan data pengguna
            const usersRef = collection(db, "users");
            const userQuery = query(usersRef, where("id", "==", userId));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
              console.error("User not found");
              return;
            }

            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();

            // Query Firestore untuk mendapatkan data siswa
            const studentsRef = collection(db, "student");
            const studentQuery = query(studentsRef, where("userId", "==", userId));
            const studentSnapshot = await getDocs(studentQuery);

            if (studentSnapshot.empty) {
              console.error("Student data not found");
              return;
            }

            const studentDoc = studentSnapshot.docs[0];
            const studentData = studentDoc.data();

            // Set data ke state
            setStudentData({
              name: userData.name,
              className: studentData.class,
              memberId: `SMPN11-${userData.id}`,
              profilImage: studentData.prifilImage, // Tambahkan gambar profil
            });
          } catch (error) {
            console.error("Error fetching student data:", error);
          }
        };

        fetchStudentData();
      } catch (error) {
        console.error("Invalid token", error);
      }
    } else {
      console.error("Token not found");
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300 hover:shadow-2xl transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-105">
      {/* Header */}
      <div className="bg-blue-500 p-4 text-center">
        <h1 className="text-3xl text-white font-bold">Kartu Anggota</h1>
      </div>

      {/* Body */}
      <div className="flex items-center p-6">
        {/* Foto Profil */}
        <img
          src={studentData.profilImage}
          alt="Foto Profil"
          className="w-32 h-32 rounded-full mr-6 border-4 border-blue-500 shadow-md"
        />

        {/* Informasi Siswa */}
        <div>
          {/* Nama */}
          <div className="mb-4">
            <p className="text-gray-700 text-sm font-semibold">Nama</p>
            <p className="text-2xl text-gray-900 font-bold">
              {studentData.name}
            </p>
          </div>

          {/* Kelas */}
          <div className="mb-4">
            <p className="text-gray-700 text-sm font-semibold">Kelas</p>
            <p className="text-lg text-gray-900 font-bold">
              {studentData.className}
            </p>
          </div>

          {/* Nomor Anggota */}
          <div className="mb-4">
            <p className="text-gray-700 text-sm font-semibold">Nomor Anggota</p>
            <p className="text-lg text-gray-900 font-bold">
              {studentData.memberId}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-4 text-center">
        <p className="text-sm text-gray-500">Perpustakaan SMPN 11 Pontianak</p>
      </div>
    </div>
  );
};

export default KartuAnggota;
