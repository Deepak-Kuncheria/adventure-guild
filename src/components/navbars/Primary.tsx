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

          <ul
            className={`navItems${
              isSidebarOpen ? " active" : " "
            } font-secondary text-highlight`}
          >
            <div className="searchBarWrapper">
              <PrimarySearchBar />
            </div>
            <li>
              {" "}
              <a href="/about">About</a>
            </li>
            <li>
              {" "}
              <a href="/books">Books</a>
            </li>
          </ul>
          <div
            className="hamburger"
            aria-label="Toggle menu"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>
      </header>
    </>
  );
};

export default PrimaryNavBar;
