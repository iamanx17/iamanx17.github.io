import React from "react";
import Header from "../Header/Header";
import About from "./About";
import Discover from "./Discover";
import Service from "./Service";
import Blog from "../blogpost/Blog";
import Api from "../apilist/Api";
import Signup from "../Home/Signup";

const Home = () => {
  return (
    <>
      <Header />
      <About />
      <Discover />
      <Service />
      <Blog />
      <Api />
      <Signup />
    </>
  );
};

export default Home;
