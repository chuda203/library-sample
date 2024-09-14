import BerandaPage from "@components/common/Beranda";
import StudentSidebar from "@components/features/Cms/Students/common/student-sidebar";
import StudentPage from "@pages/Cms/student/Anggota";
import DataBukuPage from "@pages/Cms/student/DataBuku";
import KartuAnggotaPage from "@pages/Cms/student/KartuAnggota";
import PeminjamanPage from "@pages/Cms/student/Peminjaman";
import { Route, Routes } from "react-router-dom";

const Admin = () => {
  return (
    <StudentSidebar>
      <Routes>
        <Route path="/" element={<BerandaPage />} />
        <Route path="/siswa" element={<StudentPage />} />
        <Route path="/kartu-anggota" element={<KartuAnggotaPage />} />
        <Route path="/data-buku" element={<DataBukuPage />} />
        <Route path="/peminjaman" element={<PeminjamanPage />} />
      </Routes>
    </StudentSidebar>
  );
};

export default Admin;
