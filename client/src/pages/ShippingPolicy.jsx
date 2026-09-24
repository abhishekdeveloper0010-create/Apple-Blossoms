import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Shipping Zones & Charges",
    body: [
      "We ship across India from our store in Abohar, Punjab. Shipping charges are calculated automatically based on your delivery pincode:",
    ],
    list: [
      "Local (Abohar): ₹30 — delivered in ~2 days",
      "Punjab: ₹40 — delivered in ~3 days",
      "North India: ₹60 — delivered in ~5 days",
      "West India: ₹70 — delivered in ~6 days",
      "South / East India: ₹90 — delivered in ~7 days",
      "Remote & North-East: ₹120 — delivered in ~9 days",
    ],
  },
  {
    title: "2. Free Shipping",
    body: [
      "Orders of ₹999 or more (after discounts) ship completely FREE, anywhere in India.",
    ],
  },
  {
    title: "3. Cash on Delivery (COD)",
    body: [
      "COD is available on all serviceable pincodes. A COD handling fee of ₹40 applies per order. Prepaid orders (UPI / Cards / Wallets) do not attract this fee.",
    ],
  },
  {
    title: "4. Delivery Timelines",
    body: [
      "Orders are dispatched within 1–2 business days of payment confirmation. Estimated delivery times shown at checkout are indicative — actual delivery may vary due to weather, courier load, or other factors beyond our control.",
    ],
  },
  {
    title: "5. Pincode Serviceability",
    body: [
      "You can check delivery availability by entering your pincode on the product page or at checkout. Some remote pincodes may not be serviceable; in such cases we will inform you and cancel/refund the order.",
    ],
  },
  {
    title: "6. Order Tracking",
    body: [
      "Once your order ships, a tracking number (AWB) is shared with you via email/SMS. You can also track your order anytime from the Track Order page.",
    ],
  },
  {
    title: "7. Taxes",
    body: [
      "GST is charged as per applicable Indian tax rates on apparel, footwear and beauty products. Intra-state (Punjab) orders attract CGST + SGST; inter-state orders attract IGST. A tax invoice is issued with every order.",
    ],
  },
];

function ShippingPolicy() {
  return (
    <section className="min-h-screen w-full bg-[linear-gradient(135deg,#f5fbff_0%,#eef9ff_100%)] py-10 sm:py-14 lg:py-20">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-16 2xl:px-20">
        <div className="w-full rounded-[24px] sm:rounded-[30px] lg:rounded-[36px] border border-sky-100 bg-white p-5 shadow-[0_20px_60px_-20px_rgba(2,132,199,0.22)] sm:p-8 lg:p-12 xl:p-14">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[55px] font-bold text-[#0c4a6e]">
              Shipping Policy
            </h1>

            <p className="pt-4 text-lg font-semibold text-[#0c4a6e] sm:text-xl">
              Fast, reliable and transparent delivery across India
            </p>
          </div>

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

                {section.list && (
                  <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Questions? Reach us anytime via the{" "}
            <Link to="/contact" className="font-semibold text-sky-700 underline">
              Contact page
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

export default ShippingPolicy;
