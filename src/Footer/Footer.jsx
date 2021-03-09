import React from "react";
import Newsletter from "./Newsletter";
import '../';


const Footer = () => {
  return (
    <>
      <footer className="footer text-center text-white">
        <div className="container p-4">
          <section className="mb-4 logo">
            <a
              className="btn btn-outline-light btn-floating m-1"
              href="https://www.facebook.com/piratesventure/?hc_ref=ARQVi8iXYKMDkEwWIkH_57ElCSj0tOr_W_VETxGvfNfvbqsuYDZEeCqh9LZNu60-5OU&__xts__[0]=68.ARC1Qg6mZZUcsVokULl3fprY7qzB6ntXnEHny4ILNJ3_G_ErTL98wwh3zb74Cl3G4xZQhCjGmhCEy6vDqOeQaTGgt6mAh5fmLo3oM2WpqYLXiAjc7AdO1K_pohhDzD_snlUMF6BixwLLYVKQi8PaoUF3uFf-S9oYByW83oqRF0YXuKg9aDe57xwpOgcotufxXPB6IbacxYbsDagWp4au_vbj-VpZcQHpp8b1kMCd_-K3eUCGX0SkgL0zyRyV3g3nITpYpgIaH0iTUgA_PsiAMQABYKeDAV9RGFFo66NXMZ-pLqSoDOcDapKtb_qU1n_GuQ&__tn__=kC-R"
              role="button"
            >
              <i className="bi bi-facebook"></i>
            </a>

            <a
              className="btn btn-outline-light btn-floating m-1"
              href="#!"
              role="button"
            >
              <i className="bi bi-twitter"></i>
            </a>

            <a
              className="btn btn-outline-light btn-floating m-1"
              href="#!"
              role="button"
            >
              <i class="bi bi-instagram"></i>
            </a>

            <a
              className="btn btn-outline-light btn-floating m-1"
              href="https://github.com/iamanx17/iamanx17.github.io"
              role="button"
            >
              <i className="bi bi-github"></i>
            </a>
          </section>

          <section className="">
            <form action="">
              <div className="row d-flex justify-content-center">
                <div className="col-auto">
                  <p className="pt-2">
                    <strong>Subscribe to get the lastest notifications</strong>
                  </p>
                </div>

                <div className="row justify-content-center">
                  <Newsletter />
                </div>
              </div>
            </form>
          </section>

          <section className="mb-4">
            <p>
              Apihouse is all about giving platform to api developers to share
              their api with and others and levelling up your skills.
              <br />
              Our challenge is to make this website dynamic completely using api
              only.
            </p>
          </section>

          <section className="footer">
            <div className="row">
              <div className="col mb-4 mb-md-0">
                <h5 className="text-uppercase">Useful links</h5>

                <ul className="list-unstyled mb-0">
                  <li>
                    <a
                      href="/"
                      className="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a
                      href="#about"
                      className="text-white"
                      style={{textDecoration:"none"}}
                    >
                      About us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#service"
                      className="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Service
                    </a>
                  </li>
                  <li>
                    <a
                      href="#discover"
                      className="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Discover
                    </a>
                  </li>
                </ul>
              </div>

              <div className="col mb-4 mb-md-0">
                <h5 className="text-uppercase">Follow us</h5>

                <ul className="list-unstyled mb-0">
                  <li>
                    <a
                      href="#!"
                      className="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Facebook
                    </a>
                  </li>
                  <li>
                    <a
                      href="#!"
                      className="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a
                      href="#!"
                      className="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Github
                    </a>
                  </li>
                  <li>
                    <a
                      href="#!"
                      className="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Instagram
                    </a>
                  </li>
                </ul>
              </div>

              <div className="col mb-4 mb-md-0">
                <h5 className="text-uppercase">Api's</h5>

                <ul className="list-unstyled mb-0">
                  <li>
                    <a
                      href="#!"
                      className="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Api 1
                    </a>
                  </li>
                  <li>
                    <a
                      href="#!"
                      className="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Api 2
                    </a>
                  </li>
                  <li>
                    <a
                      href="#!"
                      className="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Api 3
                    </a>
                  </li>
                  <li>
                    <a
                      href="#!"
                      className="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Api 4
                    </a>
                  </li>
                </ul>
              </div>

              <div class="col mb-4 mb-md-0">
                <h5 class="text-uppercase">Popular posts</h5>

                <ul class="list-unstyled mb-0">
                  <li>
                    <a
                      href="#!"
                      class="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Post 1
                    </a>
                  </li>
                  <li>
                    <a
                      href="#!"
                      class="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Post 2
                    </a>
                  </li>
                  <li>
                    <a
                      href="#!"
                      class="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Post 3
                    </a>
                  </li>
                  <li>
                    <a
                      href="#!"
                      class="text-white"
                      style={{textDecoration:"none"}}
                    >
                      Post 4
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div class="copy text-center p-3" style={{backgroundColor: "rgba(0, 0, 0, 0.2)"}}>
          <p>
            © 2021 Copyright Made with <i class="bi bi-heart"></i> by Aman
          </p>
          <a className="text-white" href="/">
            Apihouse.com
          </a>
        </div>
      </footer>
    </>
  );
};

export default Footer;
