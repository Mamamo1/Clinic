import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
  return (
    <>
      <Navbar />
      <main className="p-4">
        <Outlet 
          
        /> {/* This renders nested routes like /user/history */}
      </main>
    </>
  );
};

export default UserLayout;
