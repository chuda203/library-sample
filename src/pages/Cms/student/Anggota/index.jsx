import { StudentInfo } from "@components/features/Cms/Students";
import ListBorrowing from "@components/features/Cms/Students/Beranda/ui/ListBrrowing";
import React from "react";

const StudentPage = () => {
  return (
    <div className="min-h-screen mt-20 ml-72">
      <div>
        <StudentInfo />
        <ListBorrowing />
      </div>
    </div>
  );
};

export default StudentPage;
