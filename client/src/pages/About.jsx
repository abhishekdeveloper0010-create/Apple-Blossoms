function About() {
  return (
    <section className="w-full bg-white py-10 sm:py-14 lg:py-20">
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[55px] font-bold text-[#0c4a6e]">
            About Us
          </h1>

          <p className="mt-4 text-lg sm:text-xl lg:text-2xl font-medium text-slate-700">
            We bring style, comfort, and confidence together.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* About Text */}
          <div className="w-full">
            <p className="text-base sm:text-lg lg:text-xl leading-7 sm:leading-8 lg:leading-9 text-slate-600">
              Apple Blossom is a modern fashion destination focused on
              everyday elegance, premium quality, and a seamless shopping
              experience.
            </p>

            <p className="mt-5 text-base sm:text-lg lg:text-xl leading-7 sm:leading-8 lg:leading-9 text-slate-600">
              From statement pieces to daily essentials, our carefully curated
              collection is designed to fit every moment of your life.
            </p>
          </div>

          {/* Features */}
          <div className="bg-sky-50/80 p-4 sm:p-6 lg:p-8 xl:p-12 rounded-2xl sm:rounded-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
              
              {/* Curated Picks */}
              <div className="rounded-[24px] bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                  Curated Picks
                </h2>

                <p className="mt-2 text-sm sm:text-base leading-6 text-slate-600">
                  Hand-selected fashion and beauty essentials for every season.
                </p>
              </div>

              {/* Fast Delivery */}
              <div className="rounded-[24px] bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                  Fast Delivery
                </h2>

                <p className="mt-2 text-sm sm:text-base leading-6 text-slate-600">
                  Quick and reliable shipping so you can enjoy your favorites
                  sooner.
                </p>
              </div>

              {/* Customer First */}
              <div className="rounded-[24px] bg-white p-5 sm:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                  Customer First
                </h2>

                <p className="mt-2 text-sm sm:text-base leading-6 text-slate-600">
                  We are committed to making every shopping journey easy and
                  pleasant.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default About;