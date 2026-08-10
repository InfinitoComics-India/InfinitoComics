
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import URLs from '../../Utils/utils.js';
import { LogOut } from "lucide-react";
import { Button, message, Popconfirm } from "antd";


const Navbar = () => {
  const token = localStorage.getItem("authToken");
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const confirm = (e) => {
    localStorage.clear();
    message.success("LogOut successfully");
    window.location.href = "/";
  };
  const cancel = (e) => {
    console.log(e);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo / Brand */}
       <Link
         to="/"
         className="inline-block px-2 py-1 rounded-lg"
        >
      <img
       src={URLs.Logo_url}
       alt="Infinito Logo"
       className="h-12 w-auto object-contain bg-white rounded p-1"
       />
      </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-8 uppercase font-semibold text-sm">
          <Link
            to="/"
            className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
          >
            HOME
          </Link>
          <Link
            to="/comic"
            className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
          >
            COMICS
          </Link>
          <Link
            to="/users"
            className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
          >
            USERS
          </Link>
          <Link
            to="/characters"
            className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
          >
            CHARACTERS
          </Link>
          <Link
            to="/research"
            className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
          >
            RESEARCH
          </Link>
          <Link
            to="/career"
            className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
          >
            CAREER
          </Link>
          <Link
            to="/createfaq"
            onClick={toggleMenu}
            className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
          >
          FAQS
          </Link>
          <Link
            to="/createblog"
            className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
          >
            BLOGS
          </Link>
           <Link
              to="/timeline"
              onClick={toggleMenu}
              className="text-white hover:text-red-500 transition px-3 py-2"
            >
              Timeline
            </Link>
          {token ? (
            <Popconfirm
              title="Log Out"
              description="Are you sure want to log out?"
              onConfirm={confirm}
              onCancel={cancel}
              okText="Yes"
              cancelText="No"
            >
              <LogOut
                size={28}
                color="white"
                className="hover:cursor-pointer"
              />
            </Popconfirm>
          ) : (
            <Link
              to="/login"
              className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
            >
              Login
            </Link>
          )}{" "}
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="focus:outline-none"
          >
            {/* Hamburger icon */}
            <div className="w-6 h-6 flex flex-col justify-between space-y-1">
              <span className="block h-0.5 w-full bg-white"></span>
              <span className="block h-0.5 w-full bg-white"></span>
              <span className="block h-0.5 w-full bg-white"></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 bg-opacity-95 backdrop-blur-lg absolute w-full left-0 top-full py-4 shadow-lg animate-slideDown">
          <div className="flex flex-col space-y-4 px-6 uppercase font-semibold text-sm">
            <Link
              to="/"
              onClick={toggleMenu}
              className="text-white hover:text-red-500 transition"
            >
              HOME
            </Link>
            <Link
              to="/comics"
              onClick={toggleMenu}
              className="text-white hover:text-red-500 transition"
            >
              COMICS
            </Link>
            <Link
            to="/users"
            className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
          >
            USERS
          </Link>
            <Link
            to="/research"
            className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
          >
            RESEARCH
          </Link>
            <Link
              to="/characters"
              onClick={toggleMenu}
              className="text-white hover:text-red-500 transition"
            >
              CHARACTERS
            </Link>
            <Link
              to="/career"
              onClick={toggleMenu}
              className="text-white hover:text-red-500 transition"
            >
              CAREER
            </Link>
            <Link
              to="/createfaq"
              onClick={toggleMenu}
              className="text-white hover:text-red-500 transition"
            >
            FAQS
            </Link>
            <Link
              to="/createblog"
              onClick={toggleMenu}
              className="text-white hover:text-red-500 transition"
            >
              BLOGS
            </Link>

            <Link
              to="/timeline"
              onClick={toggleMenu}
              className="text-white hover:text-red-500 transition"
            >
              Timeline
            </Link>

            {token ? (
              <Popconfirm
                title="Log Out"
                description="Are you sure want to log out?"
                onConfirm={confirm}
                onCancel={cancel}
                okText="Yes"
                cancelText="No"
              >
                <LogOut
                  size={28}
                  color="white"
                  className="hover:cursor-pointer"
                />
              </Popconfirm>
            ) : (
              <Link
                to="/login"
                className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
