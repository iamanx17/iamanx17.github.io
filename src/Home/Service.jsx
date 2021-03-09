import React from "react";
import a from "../img/a.png";
import logo from "../img/logo.png";
import web from "../img/web.png";
import '../index.css';

const Service = () => {
  return (
    <>
      <section className="services py-5" id="service">
        <div className="col mx-auto align-items-center my-5">
          <div className="heading text-center pt-5 text-light">
            <h2 className="font-weight-bold pb-2">What is Apihouse</h2>
            <h5 className="font-weight-bold pb-3">
              Building this website completely dynamic through api only is our
              challenge.
            </h5>
          </div>
          <div className="row mx-auto align-items-center justify-content-center text-center container">
            <div className="one col-lg-3 col-md-3 col-12 m-2">
              <img className="img-fluid w-75" src={a} alt="" />
              <h5 className="font-weight-bold p-4">Unlimited Api</h5>
              <p>Platform for people who love to work with apis.</p>
            </div>
            <div className="one col-lg-3 col-md-3 col-12 m-2">
              <img className="img-fluid w-75" src={logo} alt="" />
              <h5 className="font-weight-bold p-4">Easy Documentation</h5>
              <p>Use our easy documentation to use api.</p>
            </div>
            <div className="one col-lg-3 col-md-3 col-12 m-2">
              <img className="img-fluid w-75" src={web} alt="" />
              <h5 className="font-weight-bold p-4">Developers Help</h5>
              <p>
                Ask for help from other developers and get your problem fixed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Service;
