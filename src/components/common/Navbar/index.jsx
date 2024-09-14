import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Cek apakah token ada di cookie
    const token = Cookies.get("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    // Hapus token dan set isLoggedIn menjadi false
    Cookies.remove("token");
    setIsLoggedIn(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="fixed navbar bg-base-100">
      <div className="flex-1">
        <Link className="text-xl btn btn-ghost">Digilib</Link>
      </div>
      <div className="flex-none">
        <ul className="px-1 space-x-2 menu menu-horizontal">
          {isLoggedIn ? (
            <li className="dropdown dropdown-end">
              <label tabIndex={0} className="avatar btn btn-ghost btn-circle">
                <div className="w-10 border-2 rounded-full shadow-lg border-slate-400">
                  <img
                    // src="https://placekitten.com/200/200"
                    src="https://static.vecteezy.com/system/resources/thumbnails/005/129/844/small_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg"
                    alt="User Avatar"
                  />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="p-2 mt-3 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
              >
                {/* <li>
                  <Link to="/profile">Profile</Link>
                </li> */}
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </li>
          ) : (
            <>
              <li>
                <Link to="/">Beranda</Link>
              </li>
              {/* <li>
                <Link to="/login">Login</Link>
              </li> */}
              {/* <li>
                <Link to="/register">Register</Link>
              </li> */}
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
