import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import URLs from '../../Utils/utils.js';
import { LogOut } from "lucide-react";
import { Button, message, Popconfirm } from "antd";
import { getRoles } from '../../Utils/auth.js';

// All nav items with their route and which roles can see them
const NAV_ITEMS = [
  { label: "HOME",            to: "/",                  roles: ["superadmin", "comics_admin", "character_admin", "research_admin", "blog_admin", "career_admin"] },
  { label: "COMICS",          to: "/comic",             roles: ["superadmin", "comics_admin"] },
  { label: "CHARACTERS",      to: "/characters",        roles: ["superadmin", "character_admin"] },
  { label: "RESEARCH",        to: "/research",          roles: ["superadmin", "research_admin"] },
  { label: "BLOGS",           to: "/createblog",        roles: ["superadmin", "blog_admin"] },
  { label: "FAQS",            to: "/createfaq",         roles: ["superadmin", "blog_admin"] },
  { label: "TIMELINE",        to: "/timeline",          roles: ["superadmin", "blog_admin"] },
  { label: "CAREER",          to: "/career",            roles: ["superadmin", "career_admin"] },
  { label: "USERS",           to: "/users",             roles: ["superadmin"] },
  { label: "ADMIN MGMT",      to: "/admin-management",  roles: ["superadmin"] },
];

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = localStorage.getItem("authToken");
  const roles = getRoles();

  const toggleMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  const confirm = () => {
    localStorage.clear();
    message.success("Logged out successfully");
    window.location.href = "/admin";
  };

  // Filter nav items — show if any of the admin's roles is in the item's roles list
  const visibleItems = NAV_ITEMS.filter(item => roles.some(r => item.roles.includes(r)));

  const NavLinks = ({ onClick }) => (
    <>
      {visibleItems.map(({ label, to }) => (
        <Link
          key={to}
          to={to}
          onClick={onClick}
          className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
        >
          {label}
        </Link>
      ))}

      {token ? (
        <Popconfirm
          title="Log Out"
          description="Are you sure you want to log out?"
          onConfirm={confirm}
          onCancel={() => {}}
          okText="Yes"
          cancelText="No"
        >
          <LogOut size={28} color="white" className="hover:cursor-pointer" />
        </Popconfirm>
      ) : (
        <Link
          to="/login"
          onClick={onClick}
          className="text-white hover:text-red-500 transition duration-200 px-3 py-2"
        >
          Login
        </Link>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="inline-block px-2 py-1 rounded-lg">
          <img
            src={URLs.Logo_url}
            alt="Infinito Logo"
            className="h-12 w-auto object-contain bg-white rounded p-1"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-1 uppercase font-semibold text-sm flex-wrap">
          <NavLinks />
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <button onClick={toggleMenu} aria-label="Toggle menu" className="focus:outline-none">
            <div className="w-6 h-6 flex flex-col justify-between space-y-1">
              <span className="block h-0.5 w-full bg-white" />
              <span className="block h-0.5 w-full bg-white" />
              <span className="block h-0.5 w-full bg-white" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 bg-opacity-95 backdrop-blur-lg absolute w-full left-0 top-full py-4 shadow-lg">
          <div className="flex flex-col space-y-4 px-6 uppercase font-semibold text-sm">
            <NavLinks onClick={toggleMenu} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
