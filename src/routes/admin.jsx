import AdminSidebar from "@components/features/Cms/Admin/common/student-sidebar";
import AnggotaPage from "@pages/Cms/admin/Anggota";
import KoleksiBukuPage from "@pages/Cms/admin/KoleksiBuku/inde";
import LaporanPage from "@pages/Cms/admin/Laporan";
import PeminjamanPage from "@pages/Cms/admin/Peminjaman";
import PengembalianPage from "@pages/Cms/admin/Pengembalian";
import PengunjungPage from "@pages/Cms/admin/Pengunjung";
import TamuPage from "@pages/Cms/admin/Tamu";
import React from "react";
import { Route, Routes } from "react-router-dom";

const Admin = () => {
  return (
    <AdminSidebar>
      <Routes>
        <Route path="/" element={<AnggotaPage />} />
        <Route path="/pengunjung" element={<PengunjungPage />} />
        <Route path="/tamu" element={<TamuPage />} />
        <Route path="/koleksi-buku" element={<KoleksiBukuPage />} />
        <Route path="/peminjaman" element={<PeminjamanPage />} />
        <Route path="/pengembalian" element={<PengembalianPage />} />
        <Route path="/laporan" element={<LaporanPage />} />
      </Routes>
    </AdminSidebar>
  );
};

export default Admin;
