import React, { useState } from "react";
import "../index.css";
import axios from "axios";

const Signup = () => {
  const [email, setEmail] = useState();
  const [first, setFirst] = useState();
  const [last, setLast] = useState();
  const [user, setUser] = useState();
  const [pass1, setPass1] = useState();
  const [pass2, setPass2] = useState();

  axios.post("http://apihousebackend.herokuapp.com/account/signup/", {
    first_name: first,
    last_name: last,
    email: email,
    password: pass1,
    username: user,
  });

  return (
    <>
      <div class="container my-5 mb-5 register">
        <h4 class="text-center display-4 font-weight-bold">Register here</h4>
        <hr class="w-50 mx-auto mb-5 mt-4" />

        <div class="contact w-50 mx-auto">
          <form onSubmit={Signup}>
            <div class="mb-3">
              <label for="exampleInputEmail1" class="form-label">
                Email address
              </label>
              <input
                required
                type="email"
                name="email"
                class="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                value={email}
              />
            </div>
            <div class="mb-3">
              <label for="exampleInputEmail1" class="form-label">
                Username
              </label>
              <input
                required
                type="text"
                name="username"
                class="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                onChange={(event) => {
                  setUser(event.target.value);
                }}
                value={user}
              />
            </div>

            <div class="mb-3">
              <label for="exampleInputEmail1" class="form-label">
                First name
              </label>
              <input
                required
                type="text"
                name="first_name"
                class="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                onChange={(event) => {
                  setFirst(event.target.value);
                }}
                value={first}
              />
            </div>
            <div class="mb-3">
              <label for="exampleInputEmail1" class="form-label">
                Last name
              </label>
              <input
                required
                type="text"
                name="last_name"
                class="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                onChange={(event) => {
                  setLast(event.target.value);
                }}
                value={last}
              />
            </div>

            <div class="mb-3">
              <label for="exampleInputEmail1" class="form-label">
                Password
              </label>
              <input
                required
                type="Password"
                name="password1"
                class="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                onChange={(event) => {
                  setPass1(event.target.value);
                }}
                value={pass1}
              />
            </div>
            <div class="mb-3">
              <label for="exampleInputEmail1" class="form-label">
                Confirm Your Password
              </label>
              <input
                required
                type="Password"
                name="password2"
                class="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                onChange={(event) => {
                  setPass2(event.target.value);
                }}
                value={pass2}
              />
            </div>

            <div id="emailHelp" class="form-text mt-2 mb-4">
              We'll never share your email with anyone else.
            </div>

            <button type="submit" class="btn btn-dark">
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
