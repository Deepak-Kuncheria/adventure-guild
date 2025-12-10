"use client";
import React, { useState } from "react";
import MainLogo from "../logo/MainLogo";
import PrimarySearchBar from "../searchBars/PrimarySearchBar";

const PrimaryNavBar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="primaryHeader">
        <nav className="primaryNavBar">
          <div className="logo">
            <MainLogo width={100} height={100} />
          </div>

          <div className="searchBarWrapper">
            <PrimarySearchBar />
          </div>

          <div className="navLinks font-secondary text-highlight">
            <a href="/about">About</a>
            <a href="/books">Books</a>
          </div>
        </nav>
        <button
          className="hamburger"
          aria-label="Toggle menu"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          {/* <HamburgerMenuIcon width={24} height={24} />
           */}
          Menu
        </button>
        <aside
          className={`mobileSidebar font-secondary text-accent-secondary ${
            isSidebarOpen ? "open" : ""
          }`}
        >
          <a href="/about">About</a>
          <a href="/books">Books</a>
        </aside>
      </header>
    </>
  );
};

export default PrimaryNavBar;
