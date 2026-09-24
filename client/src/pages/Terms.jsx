import { Link } from "react-router-dom";

const sections = [
  {
    title: "Use of Our Services",
    body: [
      "You agree to use Apple Blossom responsibly and provide accurate and complete information when creating an account or placing an order. Accounts engaged in misuse, fraud or abuse may be suspended.",
    ],
  },
  {
    title: "Orders and Availability",
    body: [
      "All orders are subject to product availability. We reserve the right to cancel or modify an order if a product becomes unavailable or if incorrect information (including an unserviceable address or pincode) is provided. In case of cancellation by us, any prepaid amount is refunded in full.",
    ],
  },
  {
    title: "Pricing & GST",
    body: [
      "All prices are listed in Indian Rupees (INR). GST is charged on every order as per the applicable Indian tax slabs for apparel, footwear and beauty products — CGST + SGST for deliveries within Punjab and IGST for deliveries outside Punjab. A GST tax invoice is issued with every order and is available from your order history.",
    ],
  },
  {
    title: "Payments",
    body: [
      "Payment information must be provided accurately. Orders are processed after successful payment confirmation according to the selected payment method. We support UPI, cards, wallets and Cash on Delivery (a COD handling fee applies). We never store your full card details.",
    ],
  },
  {
    title: "Shipping & Delivery",
    body: [
      "Delivery timelines are estimates and may vary depending on your location, product availability, weather conditions, or other external factors. Shipping charges are calculated location-wise based on your pincode and shown transparently at checkout. Please read our full Shipping Policy.",
    ],
  },
  {
    title: "Returns & Refunds",
    body: [
      "Eligible items can be returned within 7 days of delivery, subject to our Return & Refund Policy. Refunds are processed within 5–7 business days after the returned item passes quality check.",
    ],
  },
  {
    title: "Multiple Delivery Addresses",
    body: [
      "You can save multiple delivery addresses to your account and choose one at checkout. We deliver only to serviceable pincodes within India.",
    ],
  },
  {
    title: "Intellectual Property",
    body: [
      "All content on Apple Blossom — including product images, logos, text and design — is the property of Apple Blossom and may not be copied, resold or reproduced without written permission.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "To the maximum extent permitted by law, Apple Blossom shall not be liable for any indirect, incidental or consequential damages arising from the use of our services. Our total liability for any claim is limited to the value of the order concerned.",
    ],
  },
  {
    title: "Governing Law & Jurisdiction",
    body: [
      "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Punjab, India.",
    ],
  },
];

function Terms() {
  return (
    <section className="min-h-screen w-full bg-[linear-gradient(135deg,#f5fbff_0%,#eef9ff_100%)] py-10 sm:py-14 lg:py-20">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-16 2xl:px-20">
        <div className="w-full rounded-[24px] sm:rounded-[30px] lg:rounded-[36px] border border-sky-100 bg-white p-5 shadow-[0_20px_60px_-20px_rgba(2,132,199,0.22)] sm:p-8 lg:p-12 xl:p-14">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[55px] font-bold text-[#0c4a6e]">
              Terms of Service
            </h1>

            <h2 className="pt-4 pb-4 text-xl font-bold text-[#0c4a6e] sm:text-2xl lg:text-3xl">
              Our policies for a smooth shopping experience
            </h2>
          </div>

          <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9">
            By using Apple Blossom, you agree to shop responsibly, provide
            accurate information, and respect the platform&apos;s policies.
            Orders are subject to availability, and delivery timelines are
            estimates that may vary due to location or external factors.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:gap-6">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-[20px] sm:rounded-[24px] bg-sky-50 p-5 sm:p-6"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {section.title}
                </h2>

                {section.body.map((text) => (
                  <p
                    key={text}
                    className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7"
                  >
                    {text}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            See also our{" "}
            <Link to="/shipping-policy" className="font-semibold text-sky-700 underline">
              Shipping Policy
            </Link>{" "}
            and{" "}
            <Link to="/return-refund-policy" className="font-semibold text-sky-700 underline">
              Return & Refund Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

export default Terms;
