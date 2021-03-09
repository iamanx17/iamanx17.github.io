import React from "react";

const Col = (props) => {
  return (
    <>
      <div class="one col-lg-3 col-md-3 col-12 m-2">
        <img
          class="img-fluid w-75"
          src={props.imgsrc}
          className="img-fluid"
          alt=""
        />
        <h5 class="font-weight-bold p-4">{props.title}</h5>
        <p>{props.desc}</p>
        <a href={props.link} className="btn btn-dark ">
          Demo
        </a>
      </div>
    </>
  );
};

export default Col;
