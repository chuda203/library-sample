import React, { useEffect, useState } from "react";
import Sidebar from "@components/common/Sidebar";
import {
  FaUserFriends,
  FaUserCheck,
  FaUsers,
  FaBook,
  FaClipboardList,
  FaClipboard,
  FaFileAlt,
} from "react-icons/fa";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const AdminSidebar = ({ children }) => {
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
      name: "Anggota",
      path: "/admin",
      icon: <FaUserFriends />,
    },
    {
      name: "Pengunjung",
      path: "/admin/pengunjung",
      icon: <FaUserCheck />,
    },
    {
      name: "Tamu",
      path: "/admin/tamu",
      icon: <FaUsers />,
    },
    {
      name: "Koleksi Buku",
      path: "/admin/koleksi-buku",
      icon: <FaBook />,
    },
    {
      name: "Peminjaman",
      path: "/admin/peminjaman",
      icon: <FaClipboardList />,
    },
    {
      name: "Pengembalian",
      path: "/admin/pengembalian",
      icon: <FaClipboard />,
    },
    {
      name: "Laporan",
      path: "/admin/laporan",
      icon: <FaFileAlt />,
    },
  ];

  return (
    <div className="flex">
      <Sidebar title={username} links={links} />
      <div className="w-full p-4">{children}</div>
    </div>
  );
};

export default AdminSidebar;
