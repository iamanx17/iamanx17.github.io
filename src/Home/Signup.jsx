import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../img/logo.png";
import '../index.css';

const Signup = () => {
  return (
    <>
      <section className="signup py-5" id="signup">
        <div className="row align-items-center container my-5 mx-auto">
          <div className="col-lg-6 text col-md-6 col-12 pt-5 pb-5">
            <h6>Join Api Developers COmmunity Today</h6>
            <h2>Creating an account is extremly easy</h2>
            <p>Your data is safe with us.</p>
            <NavLink to="/signup" className="btn">
              Learn More
            </NavLink>
          </div>
          <div className="col-lg-6 img col-md-6 col-12 pt-5 pb-5">
            <img src={logo} className="img-fluid" alt="" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
