import React from "react";
import { Link } from "react-router-dom";

// Custom Logo Component
const LoppetLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
    {/* Background circle */}
    <circle cx="16" cy="16" r="16" fill="#1e40af"/>
    
    {/* Running figure */}
    <path d="M8 20c0-2 1-3.5 2.5-4.5s3-1.5 4.5-1.5 3 0.5 4.5 1.5S22 18 22 20s-1 3.5-2.5 4.5-3 1.5-4.5 1.5-3-0.5-4.5-1.5S8 22 8 20z" fill="#fbbf24"/>
    
    {/* Speed lines */}
    <path d="M24 8l2 2-2 2" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M26 12l2 2-2 2" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M28 16l2 2-2 2" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Finish line */}
    <rect x="6" y="6" width="2" height="20" fill="#fbbf24"/>
    <rect x="8" y="6" width="2" height="20" fill="#1e40af"/>
    <rect x="10" y="6" width="2" height="20" fill="#fbbf24"/>
    <rect x="12" y="6" width="2" height="20" fill="#1e40af"/>
  </svg>
);


const Footer = () => (
  <footer className="bg-gray-900 text-white py-8">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-4 md:mb-0">
        <LoppetLogo/>
        <span className="font-bold text-xl">Loppet</span>
      </div>
      {/* Navigation Links */}
      <nav className="flex flex-wrap gap-6 text-sm">
        <Link to="/" className="hover:underline">Hem</Link>
        <Link to="/annonser" className="hover:underline">Annonser</Link>
        <Link to="/skapa-annons" className="hover:underline">Skapa annons</Link>
        <Link to="/om-oss" className="hover:underline">Om oss</Link>
        <Link to="/faq" className="hover:underline">FAQ</Link>
      </nav>
      {/* Copyright */}
      <div className="text-xs text-gray-400 mt-4 md:mt-0">
        &copy; {new Date().getFullYear()} Loppet. Alla rättigheter förbehållna.
      </div>
    </div>
  </footer>
);

export default Footer;