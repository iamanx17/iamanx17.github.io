import React from "react";
import '../index.css';

const Signup = () => {
  return (
    <>
      <div class="container my-5 mb-5 register">
        <h4 class="text-center display-4 font-weight-bold">Register here</h4>
        <hr class="w-50 mx-auto mb-5 mt-4" />

        <div class="contact w-50 mx-auto">
          <form action="/account/register/" method="post">
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
