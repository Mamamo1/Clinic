import Slideshow from "../Slideshow";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { Link, NavLink } from 'react-router-dom';


export default function Index() {
  return (
    <div className="font-sans">
      {/* Navbar */}
      <nav className="bg-[#FFD100] p-4 flex justify-between items-center px-8">
        <div className="flex items-center space-x-3">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
            alt="NU Logo"
            className="w-12"
          />
          <span className="text-xl font-bold text-[#2C3E91]">NU-LIPA</span>
        </div>
        <div className="space-x-4 text-[#2C3E91] font-medium">
          <a href="#" className="hover:underline">Understanding</a>
          <a href="#" className="hover:underline">Exposures</a>
          <a href="#" className="hover:underline">Lorem Ipsum Typing Test</a>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="bg-[#35408E] text-white py-20 px-6 flex flex-wrap justify-between items-center w-full min-h-[80vh]">
        <div className="w-full md:w-1/2 text-center md:text-left px-6 md:px-16">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            NU-CARES: Where Student Health Meets Innovation.
          </h1>
          <p className="text-xl mb-8 max-w-lg">
            Medical Assessment and Record Keeping System for National University.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <NavLink to="/login">
            <button className="border border-white px-8 py-3 rounded text-lg font-semibold transition duration-300 hover:bg-white hover:text-[#35408E]">
                 Login
              </button>
              </NavLink>
              <NavLink to="/signup">
            <button className="border border-white px-8 py-3 rounded text-lg font-semibold transition duration-300 hover:bg-white hover:text-[#35408E]">
              Sign Up
            </button>
            </NavLink>
          </div>
        </div>
        {/* Slideshow Section */}
        <div className="w-full md:w-1/2 flex justify-center mt-12 md:mt-0 px-6 md:px-16">
          <Slideshow />
        </div>
      </section>
      {/* About Section */}
      <section className="bg-white py-12 px-6 flex flex-wrap justify-between w-full">
        <div className="w-full md:w-1/3 text-center md:text-left mb-6 md:mb-0 px-6">
          <img
            src="https://national-u.edu.ph/wp-content/uploads/2018/12/NU-Shield_FC_RGB_POS_AW.png"
            alt="NU Logo"
            className="w-20 mx-auto md:mx-0 mb-2"
          />
          <h3 className="text-xl font-bold text-[#2C3E91]">NATIONAL UNIVERSITY</h3>
           <div className="flex justify-center md:justify-start space-x-4 mt-4">
           <a href="https://www.facebook.com/NULipaPH"><FaFacebookF className="text-[#2C3E91] text-xl hover:text-blue-700" /></a>
           <a href="#"><FaTwitter className="text-[#2C3E91] text-xl hover:text-sky-500" /></a>
           <a href="#"><FaInstagram className="text-[#2C3E91] text-xl hover:text-pink-500" /></a>
            </div>
        </div>
        <div className="w-full md:w-1/3 text-center md:text-left mb-6 md:mb-0 px-6">
          <h3 className="text-xl font-bold mb-2">ABOUT NU-CARES</h3>
          <p className="text-sm text-gray-600">
            NU Online Services is a portal of all online applications that 
            National University offers to extend its support and services to clients.
          </p>
        </div>
        <div className="w-full md:w-1/3 text-center md:text-left px-6">
          <h3 className="text-xl font-bold mb-2">LOREM US</h3>
          <p className="text-sm text-gray-600">
            <i className="fas fa-phone-alt mr-2"></i>12345678910
          </p>
          <p className="text-sm text-gray-600">
            <i className="fas fa-envelope mr-2"></i>lorem@ipsum.com
          </p>
          <p className="text-sm text-gray-600">
            <i className="fas fa-map-marker-alt mr-2"></i>Industry's Standard Dummy
          </p>
        </div>
      </section>
    </div>
  );
}
