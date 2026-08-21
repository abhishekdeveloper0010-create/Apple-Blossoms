import { Link } from "react-router-dom";
import model from "../assets/model.png";

function Hero() {
  return (
  
    <section className="bg-[#dff3fb] overflow-hidden pb-[20px]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 py-10 lg:py-16 relative flex flex-col-reverse lg:flex-row items-center justify-between">
        {/* Left Content */}
        <div className="w-full lg:w-1/2 z-10 text-center lg:text-left mt-10 lg:mt-0">
          <p className="uppercase tracking-[8px] lg:tracking-[12px] text-xl md:text-2xl lg:text-3xl text-black mb-4">
            P r e m i u m
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-700 leading-tight pt-2">
            Fashion Collection
          </h1>

          <p className="mt-5 text-base md:text-lg lg:text-xl text-gray-800 leading-8 max-w-lg mx-auto lg:mx-0">
            We bring you high-quality, trendy and comfortable clothing designed
            for modern style lovers.
          </p>

          <div className="pt-10 lg:pt-20">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-[#E5A27D] text-white text-lg md:text-xl lg:text-2xl px-8 lg:px-9 py-3 lg:py-4 rounded-2xl hover:bg-[#d98e64] duration-300"
            >
              Shop Now
              <span>➜</span>
            </Link>
          </div>
        </div>

        {/* Background Circle */}
        <div className="absolute lg:right-[-695px] lg:top-[-250px] right-[-180px] top-[-100px] w-[450px] h-[450px] md:w-[700px] md:h-[700px] lg:w-[1050px] lg:h-[1080px] rounded-full bg-[#c9e8f8]"></div>

        {/* Model Image */}
        <div className="w-full lg:w-1/2 flex justify-center relative z-10 lg:right-[-220px]">
          <img
            src={model}
            alt="Fashion Model"
            className="h-[350px] md:h-[500px] lg:h-[620px] object-contain"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
