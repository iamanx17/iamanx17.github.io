import React from "react";
import { Route, Switch } from "react-router";
import home from "./Home/Home";
import Signin from './account/Signin';
import Signup from './account/Signup';
import Navbar from "./Header/Navbar";
import Footer from "./Footer/Footer";

const about = () => {
  return <h1>This is about section</h1>;
};
const discover = () => {
  return <h1>This is discover section</h1>;
};
const service = () => {
  return <h1>This is service section</h1>;
};
const blog = () => {
  return <h1>This is blog section</h1>;
};

const login = () => {
  return <h1>This is login section</h1>;
};
const error = () => {
  return <h1>This is error section</h1>;
};

const App = () => {
  return (
    <>
      <Navbar />
      <Switch>
        <Route exact path="/" component={home} />
        <Route exact path="/about" component={about} />
        <Route exact path="/discover" component={discover} />
        <Route exact path="/service" component={service} />
        <Route exact path="/blog" component={blog} />
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/login" component={login} />
        <Route exact path="/signin" component={Signin} />
        <Route component={error} />
      </Switch>
      <Footer />
    </>
  );
};

export default App;
