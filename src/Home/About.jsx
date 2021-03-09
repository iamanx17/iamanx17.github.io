import React from "react";
import { NavLink } from "react-router-dom";
import api from "../img/api.png";
import '../index.css';

const About = () => {
  return (
    <>
      <section className="about py-5" id="about">
        <div className="row align-items-center container my-5 mx-auto">
          <div className="col-lg-6 text col-md-6 col-12 pt-5 pb-5">
            <h6>premium Api</h6>
            <h2>Unlimited free api with their easy documentation</h2>
            <p>Share your developed Api and its code with others.</p>
            <NavLink to="/about" className="btn">
              Learn More
            </NavLink>
          </div>
          <div className="col-lg-6 col-md-6 col-12 pt-5 pb-5">
            <img src={api} className="img-fluid" alt="" />
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
