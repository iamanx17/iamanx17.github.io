import React from "react";
import { NavLink } from "react-router-dom";
import web from "../img/web.png";
import '../index.css';

const Discover = () => {
  return (
    <>
      <section className="discover py-5" id="discover">
        <div className="row align-items-center container my-5 mx-auto">
          <div className="col-lg-6 img col-md-6 col-12 pt-5 pb-5">
            <img src={web} className="img-fluid" alt="" />
          </div>

          <div className="col-lg-6 text col-md-6 col-12 pt-5 pb-5">
            <h6>Unlimited access to Api</h6>
            <h2>Login to your account at any time</h2>
            <p>You can pull and push source code easily from your account</p>
            <NavLink to="/signup" className="btn">
              Sign up
            </NavLink>
          </div>
        </div>
      </section>
    </>
  );
};

export default Discover;
