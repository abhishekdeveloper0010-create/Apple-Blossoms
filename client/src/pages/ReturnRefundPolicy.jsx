import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Return Window",
    body: [
      "You can request a return within 7 days of delivery, directly from the My Returns page or from your order details.",
    ],
  },
  {
    title: "2. Eligible Conditions",
    body: [
      "To be eligible for a return, the item must be:",
    ],
    list: [
      "Unused, unwashed and in the original condition",
      "In its original packaging with tags intact",
      "Accompanied by the invoice received with the order",
    ],
  },
  {
    title: "3. Non-Returnable Items",
    body: [
      "For hygiene reasons, the following cannot be returned:",
    ],
    list: [
      "Beauty and cosmetic products that have been opened or used",
      "Innerwear and personal-use accessories",
      "Items marked as 'Final Sale' at the time of purchase",
    ],
  },
  {
    title: "4. Refund Process",
    body: [
      "Once your return is picked up and passes our quality check, the refund is initiated:",
    ],
    list: [
      "Prepaid orders: refunded to the original payment method within 5–7 business days",
      "COD orders: refunded to your Apple Blossom Wallet or bank account (as you choose) within 5–7 business days",
      "Shipping charges (if any) are non-refundable except in the case of damaged/wrong items",
    ],
  },
  {
    title: "5. Damaged / Wrong Items",
    body: [
      "If you receive a damaged, defective or incorrect item, please raise the return within 48 hours of delivery with photographs. We will arrange a free reverse pickup and offer a full refund or free replacement.",
    ],
  },
  {
    title: "6. Cancellations",
    body: [
      "Orders can be cancelled free of charge any time before they are shipped, from the order tracking page. Once shipped, the regular return process applies.",
    ],
  },
  {
    title: "7. Refund Status",
    body: [
      "You can track the status of every return and refund from the My Returns page. For any questions, contact our support team.",
    ],
  },
];

function ReturnRefundPolicy() {
  return (
    <section className="min-h-screen w-full bg-[linear-gradient(135deg,#f5fbff_0%,#eef9ff_100%)] py-10 sm:py-14 lg:py-20">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-16 2xl:px-20">
        <div className="w-full rounded-[24px] sm:rounded-[30px] lg:rounded-[36px] border border-sky-100 bg-white p-5 shadow-[0_20px_60px_-20px_rgba(2,132,199,0.22)] sm:p-8 lg:p-12 xl:p-14">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[55px] font-bold text-[#0c4a6e]">
              Return & Refund Policy
            </h1>

            <p className="pt-4 text-lg font-semibold text-[#0c4a6e] sm:text-xl">
              Easy 7-day returns, honest refunds
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
            Ready to start a return? Go to{" "}
            <Link to="/my-returns" className="font-semibold text-sky-700 underline">
              My Returns
            </Link>{" "}
            or reach us via the{" "}
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

export default ReturnRefundPolicy;
