import React, { useEffect, useState } from "react";
import Sidebar from "@components/common/Sidebar";
import { FaIdCard, FaHome, FaBook, FaClipboardList } from "react-icons/fa";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const StudentSidebar = ({ children }) => {
  const [username, setUsername] = useState("Dashboard");

  useEffect(() => {
    // Ambil token dari cookie
    const token = Cookies.get("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  const links = [
    {
      name: "Beranda",
      path: "/student/siswa",
      icon: <FaHome />,
    },
    {
      name: "Kartu Anggota",
      path: "/student/kartu-anggota",
      icon: <FaIdCard />,
    },
    { name: "Data Buku", path: "/student/data-buku", icon: <FaBook /> },
    {
      name: "Peminjaman",
      path: "/student/peminjaman",
      icon: <FaClipboardList />,
    },
  ];

  return (
    <div className="flex">
      <Sidebar title={username} links={links} />
      <div className="w-full p-4">{children}</div>
    </div>
  );
};

export default StudentSidebar;
