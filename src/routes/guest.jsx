import HomePage from "@pages/Guest/HomePage";
import LoginPage from "@pages/Guest/Auth/LoginPage";
import React from "react";
import { Route, Routes } from "react-router-dom";
import RegisterPage from "@pages/Guest/Auth/RegisterPage";

const guest = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* <Route path="/login" element={<LoginPage />} /> */}
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
};

export default guest;
