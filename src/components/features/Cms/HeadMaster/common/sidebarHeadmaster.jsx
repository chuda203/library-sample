import React, { useEffect, useState } from "react";
import Sidebar from "@components/common/Sidebar";
import { FaUserFriends } from "react-icons/fa";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const HeadMasterSidebar = ({ children }) => {
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
      name: "Laporan",
      path: "/headmaster",
      icon: <FaUserFriends />,
    },
  ];

  return (
    <div className="flex">
      <Sidebar title={username} links={links} />
      <div className="w-full p-4">{children}</div>
    </div>
  );
};

export default HeadMasterSidebar;
