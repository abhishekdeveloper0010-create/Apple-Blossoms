import { Link } from "react-router-dom";

import women from "../assets/ShopLook/women.png";
import hat from "../assets/ShopLook/hat.png";
import glasses from "../assets/ShopLook/glasses.png";
import bag from "../assets/ShopLook/bag.png";

import man from "../assets/ShopLook/man.png";
import wallet from "../assets/ShopLook/wallet.png";
import shoes from "../assets/ShopLook/shoes.png";
import neekchan from "../assets/ShopLook/neekchan.png";

import facewash from "../assets/ShopLook/facewash.png";
import tea from "../assets/ShopLook/tea.png";
import cream from "../assets/ShopLook/cream.png";

function ShopTheLook() {
  return (
    <>
      {/* Top Space */}
      <div className="bg-white h-2"></div>

      <section className="bg-[#d9f0fb] pb-10 sm:pb-12 lg:pb-14">
        <div
          className="
            w-full
            max-w-[1800px]
            mx-auto
            px-4
            sm:px-6
            md:px-8
            lg:px-10
            
          "
        >
          {/* ================= HEADING ================= */}
          <h2
            className="
              text-4xl
              sm:text-4xl
              md:text-5xl
              lg:text-[50px]
              font-bold
              text-[#0c4a6e]
              mb-8
              sm:mb-10
              lg:mb-12
              pb-2
              sm:pb-4
              text-center
              lg:text-left
              pb-6
            pt-4
            "
          >
            Shop the Look
          </h2>
          <br/>

          {/* ================= CARDS ================= */}
          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-6
              sm:gap-8
              lg:gap-10
            "
          >
            {/* ================================================= */}
            {/* CARD 1 - SUMMER BRUNCH */}
            {/* ================================================= */}

            <div
              className="
                bg-white
                rounded-2xl
                p-3
                sm:p-4
                shadow-md
                w-full
              "
            >
              {/* Images */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">

                {/* Main Image */}
                <img
                  src={women}
                  alt="Summer Brunch"
                  className="
                    rounded-xl
                    w-full
                    h-[300px]
                    sm:h-[340px]
                    md:h-[360px]
                    lg:h-[420px]
                    object-cover
                  "
                />

                {/* Small Images */}
                <div className="flex flex-col gap-2 sm:gap-3">

                  <img
                    src={hat}
                    alt="Hat"
                    className="
                      rounded-xl
                      w-full
                      h-[95px]
                      sm:h-[105px]
                      md:h-[115px]
                      lg:h-[130px]
                      object-cover
                    "
                  />

                  <img
                    src={glasses}
                    alt="Glasses"
                    className="
                      rounded-xl
                      w-full
                      h-[95px]
                      sm:h-[105px]
                      md:h-[115px]
                      lg:h-[130px]
                      object-cover
                    "
                  />

                  <img
                    src={bag}
                    alt="Bag"
                    className="
                      rounded-xl
                      w-full
                      h-[100px]
                      sm:h-[110px]
                      md:h-[120px]
                      lg:h-[145px]
                      object-cover
                    "
                  />

                </div>
              </div>

              {/* Title */}
              <h3
                className="
                  text-2xl
                  sm:text-3xl
                  md:text-3xl
                  lg:text-4xl
                  font-bold
                  text-[#0c4a6e]
                  mt-5
                  sm:mt-6
                  text-center
                  uppercase
                  pt-3
                  sm:pt-5
                "
              >
                Summer Brunch
              </h3>

              {/* Description */}
              <p
                className="
                  text-center
                  text-base
                  sm:text-lg
                  md:text-xl
                  text-[#0c4a6e]
                  mt-2
                  px-2
                "
              >
                Everything you need for a stylish day out
              </p>
<br/>
              {/* Button */}
              <div className="flex justify-center mt-6 sm:mt-8">
                <Link
                  to="/shop"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    bg-[#E59C74]
                    text-white

                    text-lg
                    sm:text-xl
                    md:text-xl
                    lg:text-2xl

                    px-7
                    sm:px-8
                    md:px-9
                    lg:px-10

                    py-3
                    sm:py-3.5
                    md:py-4

                    rounded-xl
                    md:rounded-2xl

                    hover:bg-[#d8875e]
                    duration-300
                  "
                >
                  Shop the Look
                  <span className="pl-2">➜</span>
                </Link>
              </div>
            </div>

            {/* ================================================= */}
            {/* CARD 2 - BUSINESS CASUAL */}
            {/* ================================================= */}

            <div
              className="
                bg-white
                rounded-2xl
                p-3
                sm:p-4
                shadow-md
                w-full
              "
            >
              {/* Images */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">

                {/* Main Image */}
                <img
                  src={man}
                  alt="Business Casual"
                  className="
                    rounded-xl
                    w-full
                    h-[300px]
                    sm:h-[340px]
                    md:h-[360px]
                    lg:h-[420px]
                    object-cover
                  "
                />

                {/* Small Images */}
                <div className="flex flex-col gap-2 sm:gap-3">

                  <img
                    src={wallet}
                    alt="Wallet"
                    className="
                      rounded-xl
                      w-full
                      h-[70px]
                      sm:h-[80px]
                      md:h-[85px]
                      lg:h-[95px]
                      object-cover
                    "
                  />

                  <img
                    src={shoes}
                    alt="Shoes"
                    className="
                      rounded-xl
                      w-full
                      h-[110px]
                      sm:h-[130px]
                      md:h-[140px]
                      lg:h-[160px]
                      object-cover
                    "
                  />

                  <img
                    src={neekchan}
                    alt="Neck Chain"
                    className="
                      rounded-xl
                      w-full
                      h-[100px]
                      sm:h-[115px]
                      md:h-[125px]
                      lg:h-[145px]
                      object-cover
                    "
                  />

                </div>
              </div>

              {/* Title */}
              <h3
                className="
                  text-2xl
                  sm:text-3xl
                  md:text-3xl
                  lg:text-4xl
                  font-bold
                  text-[#0c4a6e]
                  mt-5
                  sm:mt-6
                  text-center
                  uppercase
                  pt-3
                  sm:pt-5
                "
              >
                Business Casual
              </h3>

              {/* Description */}
              <p
                className="
                  text-center
                  text-base
                  sm:text-lg
                  md:text-xl
                  text-[#0c4a6e]
                  mt-2
                  px-2
                "
              >
                Reimagined comfort for the modern workplace
              </p>
<br/>
              {/* Button */}
              <div className="flex justify-center mt-6 sm:mt-8">
                <Link
                  to="/shop"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    bg-[#E59C74]
                    text-white

                    text-lg
                    sm:text-xl
                    md:text-xl
                    lg:text-2xl

                    px-7
                    sm:px-8
                    md:px-9
                    lg:px-10

                    py-3
                    sm:py-3.5
                    md:py-4

                    rounded-xl
                    md:rounded-2xl

                    hover:bg-[#d8875e]
                    duration-300
                  "
                >
                  Shop the Look
                  <span className="pl-2">➜</span>
                </Link>
              </div>
            </div>

            {/* ================================================= */}
            {/* CARD 3 - FACE WASH */}
            {/* ================================================= */}

            <div
              className="
                bg-white
                rounded-2xl
                p-3
                sm:p-4
                shadow-md
                w-full
              "
            >
              {/* Images */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">

                {/* Main Image */}
                <img
                  src={facewash}
                  alt="Face Wash"
                  className="
                    rounded-xl
                    w-full
                    h-[300px]
                    sm:h-[340px]
                    md:h-[360px]
                    lg:h-[420px]
                    object-cover
                  "
                />

                {/* Small Images */}
                <div className="flex flex-col gap-2 sm:gap-3">

                  <img
                    src={tea}
                    alt="Tea Tree"
                    className="
                      rounded-xl
                      w-full
                      h-[145px]
                      sm:h-[165px]
                      md:h-[175px]
                      lg:h-[200px]
                      object-cover
                    "
                  />

                  <img
                    src={cream}
                    alt="Cream"
                    className="
                      rounded-xl
                      w-full
                      h-[145px]
                      sm:h-[165px]
                      md:h-[175px]
                      lg:h-[205px]
                      object-cover
                    "
                  />

                </div>
              </div>

              {/* Title */}
              <h3
                className="
                  text-2xl
                  sm:text-3xl
                  md:text-3xl
                  lg:text-4xl
                  font-bold
                  text-[#0c4a6e]
                  mt-5
                  sm:mt-6
                  text-center
                  pt-3
                  sm:pt-5
                "
              >
                Face Wash Oily Skin
              </h3>

              {/* Description */}
              <p
                className="
                  text-center
                  text-base
                  sm:text-lg
                  md:text-xl
                  text-[#0c4a6e]
                  mt-2
                  px-2
                "
              >
                Vitamue Tea Tree Face Wash
              </p>
<br/>
              {/* Button */}
              <div className="flex justify-center mt-6 sm:mt-8">
                <Link
                  to="/shop"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    bg-[#E59C74]
                    text-white

                    text-lg
                    sm:text-xl
                    md:text-xl
                    lg:text-2xl

                    px-7
                    sm:px-8
                    md:px-9
                    lg:px-10

                    py-3
                    sm:py-3.5
                    md:py-4

                    rounded-xl
                    md:rounded-2xl

                    hover:bg-[#d8875e]
                    duration-300
                  "
                >
                  Shop the Look
                  <span className="pl-2">➜</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default ShopTheLook;