import React from 'react';

const Col=(props)=>{
    return(
        <>
        
        <div className="col">
          <div className="card">
            <img src={props.imgsrc} className="card-img-top" alt="..." />
            <div className="card-body">
              <h5 className="card-title">{props.title}</h5>
              <p className="card-text">{props.desc}</p>
              <a href={props.link} className="btn btn-dark">
                Live preview
              </a>
            </div>
          </div>
        </div>


        </>
    )
}

export default Col;