import React from "react";
import Bg from "@assets/bg.jpeg";

const BerandaPage = () => {
  return (
    <div className="min-h-screen mt-32 ml-72">
      <div className="flex flex-col items-center justify-center space-y-4">
        <img src={Bg} alt="bg" className="shadow-lg w-[60rem] rounded-xl" />
        <h1 className="text-3xl font-bold">
          Jl. Ahmad Marzuki Akcaya. Pontianak Sel,
        </h1>
        <p className="text-xl">
          Pontianak Sel, Kota Pontianak, Kalimantan Barat 78116
        </p>
      </div>
    </div>
  );
};

export default BerandaPage;
