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
    const token = Cookies.get("token");

    if (token) {
      try {
        const base64Payload = token.split(".")[1];
        const payload = JSON.parse(atob(base64Payload));
        const userId = payload.id;

        const fetchStudentData = async () => {
          try {
            const usersRef = collection(db, "users");
            const userQuery = query(usersRef, where("id", "==", userId));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
              console.error("User not found");
              return;
            }

            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();

            const studentsRef = collection(db, "student");
            const studentQuery = query(studentsRef, where("userId", "==", userId));
            const studentSnapshot = await getDocs(studentQuery);

            if (studentSnapshot.empty) {
              console.error("Student data not found");
              return;
            }

            const studentDoc = studentSnapshot.docs[0];
            const studentData = studentDoc.data();

            const activeStatus =
              studentData.status === "active" ? "Siswa Aktif" : "Siswa Tidak Aktif";

            // Fungsi untuk mengubah timestamp menjadi format "day, dd month yyyy"
            const formatTimestamp = (timestamp) => {
              const date = new Date(timestamp.seconds * 1000);
              const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
              return date.toLocaleDateString("id-ID", options); // Menggunakan locale Indonesia
            };

            const lastBorrowedDate = studentData.lastBorrowedDate
              ? formatTimestamp(studentData.lastBorrowedDate)
              : "Belum ada peminjaman";

            setStudentData({
              name: userData.name,
              class: studentData.class,
              activeStatus: activeStatus,
              lastBorrowedDate: lastBorrowedDate,
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
