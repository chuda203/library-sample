import BerandaPage from "@components/common/Beranda";
import HeadMasterSidebar from "@components/features/Cms/HeadMaster/common/sidebarHeadmaster";
import LaporanHeadPage from "@pages/Cms/headMaster/Laporan";
import React from "react";
import { Route, Routes } from "react-router-dom";

const guest = () => {
  return (
    <HeadMasterSidebar>
      <Routes>
        <Route path="/" element={<BerandaPage />} />
        <Route path="/laporan" element={<LaporanHeadPage />} />
      </Routes>
    </HeadMasterSidebar>
  );
};

export default guest;
