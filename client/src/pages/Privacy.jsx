function Privacy() {
return ( <section className="min-h-screen w-full bg-[linear-gradient(135deg,#f5fbff_0%,#eef9ff_100%)] py-10 sm:py-14 lg:py-20"> <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-16 2xl:px-20">

 
    <div className="w-full rounded-[24px] border border-sky-100 bg-white p-5 shadow-[0_20px_60px_-20px_rgba(2,132,199,0.22)] sm:rounded-[30px] sm:p-8 lg:rounded-[36px] lg:p-12 xl:p-14">
      
      {/* Page Title */}
      <div className="text-center">
       <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[55px] font-bold text-[#0c4a6e]">
           Privacy Policy
          </h1>

        <p className="pt-4 text-1xl font-bold text-[#0c4a6e] sm:text-1xl lg:text-1xl xl:text-[28px]">
          Your information stays protected with us
        </p>
      </div>

      {/* Introduction */}
      <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9">
        We use your details only to process orders, improve your shopping
        experience, and communicate important updates about your purchase.
        Your personal data is handled with care and never shared
        unnecessarily.
      </p>

      {/* Privacy Sections */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:gap-6">
        
        <div className="rounded-[20px] bg-sky-50 p-5 sm:rounded-[24px] sm:p-6">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Information We Collect
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            We may collect information such as your name, email address,
            phone number, delivery address, and order details when you use
            our services or place an order.
          </p>
        </div>

        <div className="rounded-[20px] bg-sky-50 p-5 sm:rounded-[24px] sm:p-6">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            How We Use Your Information
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            Your information is used to process orders, provide customer
            support, improve our services, and send important updates
            related to your purchases.
          </p>
        </div>

        <div className="rounded-[20px] bg-sky-50 p-5 sm:rounded-[24px] sm:p-6">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Data Protection
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            We take reasonable measures to protect your personal
            information and keep your data secure from unauthorized access
            or unnecessary disclosure.
          </p>
        </div>

        <div className="rounded-[20px] bg-sky-50 p-5 sm:rounded-[24px] sm:p-6">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Your Privacy Matters
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            We respect your privacy and aim to provide a safe and
            trustworthy shopping experience. We do not share your personal
            information unnecessarily.
          </p>
        </div>

      </div>
    </div>
  </div>
</section>
 

);
}

export default Privacy;
