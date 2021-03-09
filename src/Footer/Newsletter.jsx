import React, { useState } from "react";
import axios from "axios";
import '../index.css';

const Newsletter = () => {
  const [email, setEmail] = useState();

  async function postemail(event) {
    event.preventDefault();
    axios.post("https://apihousebackend.herokuapp.com/blog/newsletter/", {
      email: email,
    });
  }
  return (
    <>
      <form class="w-50 mx-auto" onSubmit={postemail}>
        <div class="col ">
          <div class="form-outline form-white mb-4">
            <input
              required
              type="email"
              id="form5Example2"
              class="form-control"
              placeholder="Email address"
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              value={email}
            />
          </div>
        </div>

        <div class="col">
          <button type="submit" class="btn btn-success">
            Subscribe
          </button>
        </div>
      </form>
    </>
  );
};

export default Newsletter;
