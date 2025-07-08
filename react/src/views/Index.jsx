"use client"

import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaStethoscope,
  FaUserMd,
  FaShieldAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaChevronDown,
  FaPlay,
  FaCheckCircle,
  FaCalendarAlt,
  FaLaptopMedical,
} from "react-icons/fa"

// Mock Slideshow component for demo
const Slideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = [
    {
      image: "/placeholder.svg?height=400&width=600",
      title: "Modern Healthcare",
      description: "Advanced medical facilities",
    },
    {
      image: "/placeholder.svg?height=400&width=600",
      title: "Student Wellness",
      description: "Comprehensive health services",
    },
    {
      image: "/placeholder.svg?height=400&width=600",
      title: "Digital Records",
      description: "Secure health management",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-xl font-bold mb-2">{slide.title}</h3>
              <p className="text-sm opacity-90">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-yellow-400 scale-125" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function NULandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Enhanced Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
            : "bg-gradient-to-r from-yellow-400 to-yellow-500 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-blue-800">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
                  alt="NU Logo"
                  className="w-8 h-8"
                />
              </div>
              <div>
                <span className="text-xl font-bold text-blue-900">NU-CARES</span>
                <p className="text-xs text-blue-700 font-medium">Lipa Campus</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#about"
                className={`font-medium transition-colors hover:text-blue-800 ${
                  isScrolled ? "text-blue-900" : "text-blue-900"
                }`}
              >
                About NU-CARES
              </a>
              <a
                href="#services"
                className={`font-medium transition-colors hover:text-blue-800 ${
                  isScrolled ? "text-blue-900" : "text-blue-900"
                }`}
              >
                Services
              </a>
              <a
                href="#contact"
                className={`font-medium transition-colors hover:text-blue-800 ${
                  isScrolled ? "text-blue-900" : "text-blue-900"
                }`}
              >
                Contact
              </a>
            </div>

            <div className="flex items-center space-x-3">
              <NavLink to="/login">
                <button className="px-6 py-2 border-2 border-blue-800 text-blue-800 rounded-lg font-semibold hover:bg-blue-800 hover:text-white transition-all duration-300">
                  Login
                </button>
              </NavLink>
              <NavLink to="/signup">
                <button className="px-6 py-2 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 transition-all duration-300 shadow-md">
                  Sign Up
                </button>
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-20 w-48 h-48 bg-yellow-300/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-300/10 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <div className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh]">
            {/* Left Content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
              <div className="mb-6">
                <div className="inline-flex items-center bg-yellow-400/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <FaStethoscope className="text-yellow-400 mr-2" />
                  <span className="text-yellow-300 font-medium">National University Medical Portal</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-white">NU-CARES:</span>
                <br />
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                  Where Student Health
                </span>
                <br />
                <span className="text-white">Meets Innovation</span>
              </h1>

              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl">
                Advanced Medical Assessment and Record Keeping System for National University students, faculty, and
                staff.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <NavLink to="/login">
                  <button className="group px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <FaPlay className="inline mr-2 group-hover:translate-x-1 transition-transform" />
                    Access Portal
                  </button>
                </NavLink>
                <NavLink to="/signup">
                  <button className="px-8 py-4 border-2 border-yellow-400 text-yellow-400 rounded-lg text-lg font-semibold hover:bg-yellow-400 hover:text-blue-900 transition-all duration-300">
                    Create Account
                  </button>
                </NavLink>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">24/7</div>
                  <div className="text-sm text-blue-200">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">100%</div>
                  <div className="text-sm text-blue-200">Secure</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">5K+</div>
                  <div className="text-sm text-blue-200">Students</div>
                </div>
              </div>
            </div>

            {/* Right Content - Slideshow */}
            <div className="w-full lg:w-1/2 flex justify-center">
              <Slideshow />
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <FaChevronDown className="text-yellow-400 text-2xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Why Choose NU-CARES?</h2>
            <p className="text-xl text-blue-600 max-w-3xl mx-auto">
              Experience the future of healthcare management with our comprehensive digital platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FaLaptopMedical,
                title: "Digital Records",
                description: "Secure, accessible medical records anytime, anywhere",
                color: "bg-blue-500",
              },
              {
                icon: FaUserMd,
                title: "Expert Care",
                description: "Professional medical staff and healthcare providers",
                color: "bg-green-500",
              },
              {
                icon: FaCalendarAlt,
                title: "Easy Scheduling",
                description: "Book appointments and manage your healthcare schedule",
                color: "bg-yellow-500",
              },
              {
                icon: FaShieldAlt,
                title: "Privacy First",
                description: "Your health information is protected and confidential",
                color: "bg-red-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div
                  className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{feature.title}</h3>
                <p className="text-blue-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* NU Branding */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
                    alt="NU Logo"
                    className="w-16 h-16"
                  />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">NATIONAL UNIVERSITY</h3>
              <p className="text-blue-600 mb-6">Lipa Campus - Excellence in Education and Healthcare</p>

              <div className="flex justify-center lg:justify-start space-x-4">
                <a
                  href="https://www.facebook.com/NULipaPH"
                  className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white hover:bg-sky-600 transition-colors"
                >
                  <FaTwitter />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition-colors"
                >
                  <FaInstagram />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                >
                  <FaYoutube />
                </a>
              </div>
            </div>

            {/* About NU-CARES */}
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">ABOUT NU-CARES</h3>
              <p className="text-blue-600 mb-6">
                NU-CARES is a comprehensive digital health platform designed specifically for the National University
                community. Our system streamlines medical record management, appointment scheduling, and healthcare
                delivery for students, faculty, and staff.
              </p>
              <div className="space-y-3">
                {["Secure Digital Records", "24/7 Access", "Professional Healthcare", "Student-Focused"].map(
                  (item, index) => (
                    <div key={index} className="flex items-center justify-center lg:justify-start">
                      <FaCheckCircle className="text-green-500 mr-3" />
                      <span className="text-blue-700">{item}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div id="contact" className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">CONTACT US</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <FaPhone className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-blue-900 font-medium">+63 43 756 5555</p>
                    <p className="text-blue-600 text-sm">Medical Hotline</p>
                  </div>
                </div>
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <FaEnvelope className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-blue-900 font-medium">nucares@nu-lipa.edu.ph</p>
                    <p className="text-blue-600 text-sm">Medical Support</p>
                  </div>
                </div>
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <FaMapMarkerAlt className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-blue-900 font-medium">NU Lipa Campus</p>
                    <p className="text-blue-600 text-sm">Lipa City, Batangas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mr-4">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
                  alt="NU Logo"
                  className="w-10 h-10"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold">NU-CARES</h3>
                <p className="text-yellow-300">National University - Lipa Campus</p>
              </div>
            </div>
            <p className="text-blue-200 mb-4">Empowering health and wellness through innovative digital solutions</p>
            <div className="border-t border-blue-700 pt-6">
              <p className="text-blue-300 text-sm">© 2025 National University - Lipa Campus. All rights reserved.</p>
              <p className="text-blue-400 text-xs mt-1">Building tomorrow's leaders today</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
