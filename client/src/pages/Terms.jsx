function Terms() {
return ( <section className="min-h-screen w-full bg-[linear-gradient(135deg,#f5fbff_0%,#eef9ff_100%)] py-10 sm:py-14 lg:py-20"> <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-16 2xl:px-20">

 
    <div className="w-full rounded-[24px] sm:rounded-[30px] lg:rounded-[36px] border border-sky-100 bg-white p-5 shadow-[0_20px_60px_-20px_rgba(2,132,199,0.22)] sm:p-8 lg:p-12 xl:p-14">
      
      <div className="text-center">
         <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[55px] font-bold text-[#0c4a6e]">
          Terms of Service
          </h1>

        <h1 className="pt-4 pb-4 text-3xl font-bold text-[#0c4a6e] sm:text-4xl lg:text-5xl xl:text-[28px]">
          Our policies for a smooth shopping experience
        </h1>
      </div>

      <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9">
        By using Apple Blossom, you agree to shop responsibly, provide
        accurate information, and respect the platform&apos;s policies.
        Orders are subject to availability, and delivery timelines are
        estimates that may vary due to location or external factors.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:gap-6">
        
        <div className="rounded-[20px] sm:rounded-[24px] bg-sky-50 p-5 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Use of Our Services
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            You agree to use Apple Blossom responsibly and provide accurate
            and complete information when creating an account or placing an
            order.
          </p>
        </div>

        <div className="rounded-[20px] sm:rounded-[24px] bg-sky-50 p-5 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Orders and Availability
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            All orders are subject to product availability. We reserve the
            right to cancel or modify an order if a product becomes
            unavailable or if incorrect information is provided.
          </p>
        </div>

        <div className="rounded-[20px] sm:rounded-[24px] bg-sky-50 p-5 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Payments
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            Payment information must be provided accurately. Orders will be
            processed after successful payment confirmation according to the
            selected payment method.
          </p>
        </div>

        <div className="rounded-[20px] sm:rounded-[24px] bg-sky-50 p-5 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Delivery
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            Delivery timelines are estimates and may vary depending on your
            location, product availability, weather conditions, or other
            external factors.
          </p>
        </div>

      </div>
    </div>
  </div>
</section>
 

);
}

export default Terms;
