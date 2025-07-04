import React from "react";
import MainLogo from "../logo/MainLogo";
import PrimarySearchBar from "../searchBars/PrimarySearchBar";

const Primary = () => {
  return (
    <header className="primaryHeader">
      <nav className="primaryNavBar">
        <MainLogo></MainLogo>
        <div className="navItems">
          <ul>
            <li>About</li>
            <li>Books</li>
          </ul>
          <PrimarySearchBar></PrimarySearchBar>
        </div>
      </nav>
    </header>
  );
};

export default Primary;
