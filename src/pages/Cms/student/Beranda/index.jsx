import { StudentInfo } from "@components/features/Cms/Students";
import ListBorrowing from "@components/features/Cms/Students/Beranda/ui/ListBrrowing";
import React from "react";

const StudentPage = () => {
  return (
    <div className="min-h-screen ml-72">
      <StudentInfo />
      <ListBorrowing />
    </div>
  );
};

export default StudentPage;
