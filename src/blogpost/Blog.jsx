import React, { useState } from "react";
import axios from "axios";
import Col from '../blogpost/Col';

const Blog = () => {
  const [post, setPost] = useState();
  const fetchdata = async () => {
    const res = await axios.get(
      "https://apihousebackend.herokuapp.com/blog/blogposts/"
    );
    setPost(res.data);
  };

  fetchdata();
  return (
    <>
     <section class="signup py-5" id="blog">
      <div class="heading text-center pt-5 text-dark">
        <h1 class="font-weight-bold pb-5">Our blog</h1>
      </div>
      <div class="row row-cols-1 row-cols-md-3 g-4 container mx-auto">
   
      {post && post.map((props, index) => {
          return (
            <Col
              key={index}
              title={props.title}
              desc={props.content}
              imgsrc={props.img}
              link={props.slug}
            />
          );
        })}
         </div>
    </section>
    </>
  );
};

export default Blog;
