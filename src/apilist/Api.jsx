import axios from "axios";
import React, { useState } from "react";
import Col from "../apilist/Col";

const Api = (props) => {
  const [api, setApi] = useState();

  const fetchdata = async () => {
    const res = await axios.get(
      "https://apihousebackend.herokuapp.com/apihouse/apilist/"
    );
    setApi(res.data);
  };

  fetchdata();
  return (
    <>
      <section class="services py-5" id="service">
        <div class="col mx-auto align-items-center my-5">
          <div class="heading text-center pt-5 text-light">
            <h2 class="font-weight-bold pb-5">Some Awesome Api's</h2>
          </div>
          <div class="row mx-auto align-items-center justify-content-center text-center container">
            {api &&
              api.map((props, index) => {
                return (
                  <Col
                    key={index}
                    title={props.title}
                    desc={props.desc}
                    link={props.link}
                    imgsrc={props.img}
                  />
                );
              })}
          </div>
        </div>
      </section>
    </>
  );
};

export default Api;
