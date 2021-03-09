import React from "react";
import '../index.css';

const Signin = () => {
  return (
    <>
      <div class="container mt-5 mb-5 login">
        <h4 class="text-center display-4 font-weight-bold">Login</h4>
        <hr class="w-50 mx-auto mb-5 mt-4" />

        <div class="contact w-25 mx-auto">
          <form >
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
              />
            </div>

            <div class="mb-3">
              <label for="exampleInputEmail1" class="form-label">
                Password
              </label>
              <input
                required
                type="Password"
                name="passwordx"
                class="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
              />
            </div>

            <button class="btn btn-dark">
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signin;
