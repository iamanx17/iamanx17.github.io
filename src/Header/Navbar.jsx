import React from "react";
import { NavLink } from "react-router-dom";
import '../index.css';

const Navbar = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="/">
            Api House
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/about">
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/Discover">
                  Discover
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/service">
                  Service
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/blog">
                  Our blog
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/signup">
                  Signup
                </NavLink>
              </li>
            </ul>

            <NavLink className="btn text-dark signin" to="/signin">
              Sign in
            </NavLink>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
