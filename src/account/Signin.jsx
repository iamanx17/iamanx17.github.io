import React, { useState } from "react";
import '../index.css';
import axios from 'axios';

const Signin = () => {
  const [user,setUser]=useState();
  const [pass,setPass]=useState();

  axios.post("https://apihousebackend.herokuapp.com/account/signin",{
    username:user,
    password:pass

  })

  return (
    <>
      <div class="container mt-5 mb-5 login">
        <h4 class="text-center display-4 font-weight-bold">Login</h4>
        <hr class="w-50 mx-auto mb-5 mt-4" />

        <div class="contact w-25 mx-auto">
          <form onSubmit={Signin}>
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
                onChange={(event)=>{
                  setUser(event.target.value)
                }}
                value={user}
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
                onChange={(event)=>{
                  setPass(event.target.value)
                }}
                value={pass}
              />
            </div>

            <button type='submit' class="btn btn-dark">
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signin;
