import { Link } from "react-router-dom";
import { useState } from "react";
import { FaHeart } from "react-icons/fa";

import women from "../assets/BestSeller/women.png";
import men from "../assets/BestSeller/men.png";
import hoodie from "../assets/BestSeller/hoodie.png";
import offer from "../assets/BestSeller/offer.png";

function BestSeller() {
  const [liked, setLiked] = useState([false, false, false]);

  return (
    <>
      <div className="bg-white py-2"></div>

      <section className="bg-[#d9f0fb] pb-10">
        <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Heading */}
          <h2
            className="
              text-5xl
              sm:text-4xl
              md:text-5xl
              lg:text-[50px]
              font-bold
              text-[#0c4a6e]
              pb-8
              pt-4
              sm:mb-10
              md:mb-12
              text-center
              lg:text-left
            "
          >
            Best Sellers
          </h2>

          <div className="flex flex-col xl:flex-row gap-8 md:gap-10">
            {/* Products */}
            <div className="w-full xl:w-[65%]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {/* Product 1 */}
                <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-md relative text-center">
                  <button
                    onClick={() =>
                      setLiked((prev) => {
                        const updated = [...prev];
                        updated[0] = !updated[0];
                        return updated;
                      })
                    }
                    className="
                      absolute
                      top-4
                      right-4
                      sm:top-6
                      sm:right-6
                      text-2xl
                      sm:text-3xl
                      transition-all
                      duration-300
                      z-10
                    "
                  >
                    <FaHeart
                      className={
                        liked[0]
                          ? "text-red-500"
                          : "text-white drop-shadow-[0_0_2px_#000]"
                      }
                    />
                  </button>

                  <img
                    src={women}
                    alt="Dress"
                    className="
                      w-full
                      h-[280px]
                      sm:h-[320px]
                      md:h-[350px]
                      lg:h-[380px]
                      object-cover
                      rounded-xl
                    "
                  />

                  <h3
                    className="
                      text-lg
                      sm:text-xl
                      md:text-2xl
                      font-semibold
                      text-[#0c4a6e]
                      pt-4
                      sm:mt-5
                      px-1
                    "
                  >
                    Elegant Floral Dress
                  </h3>

                  <p
                    className="
                      text-2xl
                      sm:text-3xl
                      md:text-4xl
                      font-bold
                      mt-2
                      sm:mt-3
                    "
                  >
                    ₹2,499
                  </p>
                </div>

                {/* Product 2 */}
                <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-md relative text-center">
                  <button
                    onClick={() =>
                      setLiked((prev) => {
                        const updated = [...prev];
                        updated[1] = !updated[1];
                        return updated;
                      })
                    }
                    className="
                      absolute
                      top-4
                      right-4
                      sm:top-6
                      sm:right-6
                      text-2xl
                      sm:text-3xl
                      transition-all
                      duration-300
                      z-10
                    "
                  >
                    <FaHeart
                      className={
                        liked[1]
                          ? "text-red-500"
                          : "text-white drop-shadow-[0_0_2px_#000]"
                      }
                    />
                  </button>

                  <img
                    src={men}
                    alt="Jacket"
                    className="
                      w-full
                      h-[280px]
                      sm:h-[320px]
                      md:h-[350px]
                      lg:h-[380px]
                      object-cover
                      rounded-xl
                    "
                  />

                  <h3
                    className="
                      text-lg
                      sm:text-xl
                      md:text-2xl
                      font-semibold
                      text-[#0c4a6e]
                      pt-4
                      sm:mt-5
                      px-1
                    "
                  >
                    Casual Denim Jacket
                  </h3>

                  <p
                    className="
                      text-2xl
                      sm:text-3xl
                      md:text-4xl
                      font-bold
                      mt-2
                      sm:mt-3
                    "
                  >
                    ₹1,999
                  </p>
                </div>

                {/* Product 3 */}
                <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-md relative text-center">
                  <button
                    onClick={() =>
                      setLiked((prev) => {
                        const updated = [...prev];
                        updated[2] = !updated[2];
                        return updated;
                      })
                    }
                    className="
                      absolute
                      top-4
                      right-4
                      sm:top-6
                      sm:right-6
                      text-2xl
                      sm:text-3xl
                      transition-all
                      duration-300
                      z-10
                    "
                  >
                    <FaHeart
                      className={
                        liked[2]
                          ? "text-red-500"
                          : "text-white drop-shadow-[0_0_2px_#000]"
                      }
                    />
                  </button>

                  <img
                    src={hoodie}
                    alt="Hoodie"
                    className="
                      w-full
                      h-[280px]
                      sm:h-[320px]
                      md:h-[350px]
                      lg:h-[380px]
                      object-cover
                      rounded-xl
                    "
                  />

                  <h3
                    className="
                      text-lg
                      sm:text-xl
                      md:text-2xl
                      font-semibold
                      text-[#0c4a6e]
                      pt-4
                      sm:mt-5
                      px-1
                    "
                  >
                    Black Hoodie
                  </h3>

                  <p
                    className="
                      text-2xl
                      sm:text-3xl
                      md:text-4xl
                      font-bold
                      mt-2
                      sm:mt-3
                    "
                  >
                    ₹1,499
                  </p>
                </div>
              </div>
              <br />
              <br />
              <br />
              {/* View All */}
              <div className="flex justify-center mt-8 sm:mt-10 md:mt-12">
                <Link
                  to="/shop"
                  className="
    inline-flex
    items-center
    justify-center
    bg-[#82c2df]
    border-2
    sm:border-2
    md:border-4
    border-white
    text-white

    text-xl
    sm:text-2xl
    md:text-2xl
    lg:text-3xl

    px-10
    sm:px-12
    md:px-14
    lg:px-16

    py-3
    sm:py-3.5
    md:py-4
    lg:py-4

    rounded-full
    hover:bg-white
    hover:text-sky-700
    duration-300
  "
                >
                  View All
                  <span className="pl-3">➜</span>
                </Link>
              </div>
            </div>

            {/* Offer Banner */}
            <div className="w-full xl:w-[35%]">
              <div className="relative rounded-3xl overflow-hidden shadow-lg">
                <img
                  src={offer}
                  alt="Offer"
                  className="
                    w-full
                    h-[450px]
                    sm:h-[500px]
                    md:h-[550px]
                    lg:h-[620px]
                    object-cover
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-[#b97d5b]/35
                    flex
                    flex-col
                    justify-center
                    items-center
                    text-white
                    text-center
                    px-5
                    sm:px-6
                    pt-10
                    sm:pt-20
                    md:pt-[120px]
                    lg:pt-[190px]
                  "
                >
                  <h3
                    className="
                      text-3xl
                      sm:text-4xl
                      md:text-5xl
                      font-light
                      mb-5
                      md:mb-6
                    "
                  >
                    Special Offer
                  </h3>

                  <hr className="w-full border-t-2 border-white" />

                  <h2
                    className="
                      text-3xl
                      sm:text-4xl
                      md:text-5xl
                      lg:text-5xl
                      font-bold
                      leading-tight
                      pt-3
                    "
                  >
                    GET 40% OFF
                  </h2>

                  <p
                    className="
                      text-lg
                      sm:text-xl
                      md:text-2xl
                      lg:text-3xl
                      mt-4
                      md:mt-6
                      tracking-wide
                    "
                  >
                    YOUR FIRST ORDER
                  </p>
                  <br />
                  <br />
                  <Link
                    to="/shop"
                    className="
                      mt-8
                      sm:mt-10
                      md:mt-16
                      bg-white
                      text-[#8d4b2f]
                      text-base
                      sm:text-lg
                      md:text-xl
                      lg:text-3xl
                      px-6
                      sm:px-8
                      md:px-10
                      lg:px-12
                      py-2.5
                      sm:py-3
                      md:py-4
                      rounded-lg
                      md:rounded-xl
                      hover:bg-[#F2E1D8]
                      duration-300
                      inline-flex
                      items-center
                      justify-center
                      
                    "
                  >
                    Shop Now
                    <span className="pl-2">➜</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default BestSeller;
