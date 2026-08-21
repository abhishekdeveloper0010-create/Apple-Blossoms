import { Link } from "react-router-dom";

import women from "../assets/women.png";
import men from "../assets/men.png";
import shoes from "../assets/shoes.png";

function Categories() {
  return (
    <>
      <div className="bg-[white] py-2"></div>
      <section className="bg-[#d9f0fb] pb-10">
        <div className="max-w-8xl mx-auto px-8 ">
          {/* Heading */}
          <h2 className="text-[50px] font-bold text-[#0c4a6e] mb-12">
            Categories
          </h2>

          {/* Cards */}
          <div className="flex flex-col lg:flex-row gap-8 pt-10">
            {/* Women */}
            <div className="bg-white rounded-2xl shadow-md p-4 text-center lg:w-[30%]">
              <img
                src={women}
                alt="Women"
                className="w-full h-[400px] object-cover rounded-xl"
              />

              <h3 className="text-3xl font-semibold pt-5  ">Women</h3>
              <div className="pt-6"></div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 sm:gap-3 mt-6 bg-[#E59C74] text-white text-base sm:text-lg md:text-2xl px-5 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl hover:bg-[#d8875e] duration-300"
              >
                Shop Women
                <span>➜</span>
              </Link>
            </div>

            {/* Men */}
            <div className="bg-white rounded-2xl shadow-md p-4 text-center lg:w-[30%]">
              <img
                src={men}
                alt="Men"
                className="w-full h-[400px] object-cover rounded-xl"
              />

              <h3 className="text-3xl font-semibold pt-5 ">Men</h3>
              <div className="pt-6"></div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 sm:gap-3 mt-6 bg-[#82c2df] text-white text-base sm:text-lg md:text-2xl px-5 py-3 sm:px-7 sm:py-3 md:px-10 md:py-4 rounded-xl md:rounded-2xl hover:bg-[#6eb3d3] duration-300"
              >
                Shop Men
                <span>➜</span>
              </Link>
            </div>

            {/* Shoes */}
            <div className="bg-white rounded-2xl shadow-md p-4 text-center lg:w-[40%]">
              <img
                src={shoes}
                alt="Shoes"
                className="w-full h-[400px] object-cover rounded-xl"
              />

              <h3 className="text-3xl font-semibold pt-5">Shoes</h3>
              <div className="pt-6"></div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-4 sm:gap-5 md:gap-6 mt-6 border-2 border-sky-200 text-sky-700 text-base sm:text-lg md:text-2xl px-5 py-3 sm:px-7 sm:py-3 md:px-10 md:py-4 rounded-xl md:rounded-2xl hover:bg-[#82c2df] hover:text-white duration-300"
              >
                Shop Now
                <span>➜</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Categories;
