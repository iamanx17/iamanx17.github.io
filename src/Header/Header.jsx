import React from "react";
import { NavLink } from "react-router-dom";
import video from "../img/26.mp4";
import '../index.css';

const Header = () => {
  return (
    <>
      <div className="mid text-light text-center">
        <video src={video} className="img-fluid" autoPlay muted loop></video>
        <div className="overlay"></div>
        <div className="hero">
          <h3 className="display-4 fw-bold">Welcome to Api house</h3>
          <p className="mx-auto">Platform for api developers</p>
          <NavLink to="/signup" className="btn text-dark">
            Get started
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default Header;
