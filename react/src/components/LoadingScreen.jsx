import React from "react";
import { useLoading } from "../components/LoadingContext";

const LoadingScreen = () => {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
      <div className="flex flex-col justify-center items-center">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
          alt="NU Logo"
          className="w-24 h-24 animate-spin-center"
        />
        <p className="mt-4 text-white text-center font-bold text-2xl">Processing...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
