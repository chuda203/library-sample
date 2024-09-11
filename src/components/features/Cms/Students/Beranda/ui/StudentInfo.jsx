import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@api/firebaseConfig"; // Mengimpor Firestore instance
import Cookies from "js-cookie";

const StudentInfo = () => {
  const [studentData, setStudentData] = useState({
    name: "",
    class: "",
    activeStatus: "",
    lastBorrowedDate: "",
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

        // Fungsi untuk mengambil data siswa berdasarkan ID user
        const fetchStudentData = async () => {
          try {
            // Query untuk mendapatkan data pengguna dari collection 'users'
            const usersRef = collection(db, "users");
            const userQuery = query(usersRef, where("id", "==", userId));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
              console.error("User not found");
              return;
            }

            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();

            // Query untuk mendapatkan data siswa dari collection 'student'
            const studentsRef = collection(db, "student");
            const studentQuery = query(studentsRef, where("userId", "==", userId));
            const studentSnapshot = await getDocs(studentQuery);

            if (studentSnapshot.empty) {
              console.error("Student data not found");
              return;
            }

            const studentDoc = studentSnapshot.docs[0];
            const studentData = studentDoc.data();

            // Mengambil status dari field 'status' di student collection
            const activeStatus =
              studentData.status === "active" ? "Siswa Aktif" : "Siswa Tidak Aktif";

            // Set data ke state
            setStudentData({
              name: userData.name,
              class: studentData.class,
              activeStatus: activeStatus,
              lastBorrowedDate: studentData.lastBorrowedDate || "Belum ada peminjaman",
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
    <div className="p-6 border border-slate-950 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Info Siswa</h2>
      <div className="mb-4">
        <span className="font-semibold">Nama: </span>
        <span>{studentData.name}</span>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Kelas: </span>
        <span>{studentData.class}</span>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Status Keaktifan: </span>
        <span>{studentData.activeStatus}</span>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Terakhir Meminjam Buku Pada: </span>
        <span>{studentData.lastBorrowedDate}</span>
      </div>
    </div>
  );
};

export default StudentInfo;
