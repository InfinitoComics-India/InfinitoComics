import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
const RefundPolicyPDF = "/RefundPolicy.pdf";

const Section = ({ title, icon, children }) => (
  <motion.section
    className="bg-white shadow-md hover:shadow-xl rounded-xl p-6 space-y-4 transition-all duration-300"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    <h2 className="text-xl font-semibold text-red-700 flex items-center gap-2">
      <span className="text-2xl">{icon}</span>
      {title}
    </h2>
    {children}
  </motion.section>
);

const RefundPolicy = () => {
  return (
    <div className="bg-gradient-to-b from-[#fff6f6] via-[#ffeaea] to-white min-h-screen px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Hero */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900">💰 Refund Policy</h1>
          <p className="text-sm text-gray-500 mb-2 font-bold">
            Effective Date: 15th August, 2025
          </p>
          <p className="text-gray-700 text-lg">
            At Infinito Comics, we are committed to providing our customers with a seamless and enjoyable
experience. This Refund Policy outlines the terms and conditions regarding refunds for our digital
content. Please read this policy carefully prior to making a purchase
          </p>
          <a
            href={RefundPolicyPDF}
            download
            className="inline-block mt-4 bg-[#FF2D2D] text-white px-4 py-2 rounded font-semibold text-sm hover:bg-red-700 transition"
          >
            Download Refund Policy PDF
          </a>
        </motion.div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-red-600 font-medium border-b pb-2">
          <Link to="/" className="hover:underline transition-colors duration-300">Home</Link>
          <span>›</span>
          <span className="text-black font-bold">Refund Policy</span>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* <Section title="Introduction" icon="📜">
            <p>
              At Infinito Comics, we are committed to providing our customers with a seamless and enjoyable 
              experience. This Refund Policy outlines the terms and conditions regarding refunds for our digital 
              content. Please read this policy carefully prior to making a purchase.
            </p>
          </Section> */}

          <Section title="Digital Content Refunds" icon="💻">
            <p>
              Infinito Comics does not offer refunds for digital comic purchases, which include downloadable 
              files, online reading access, or permanently licensed content, once the order is confirmed and 
              access has been granted. This policy is in place due to the nature of digital content, which, once 
              delivered, cannot be “returned” in the traditional sense and remains in the customer’s possession 
              indefinitely.
            </p>
          </Section>

          <Section title="Exceptions – Technical Issues" icon="⚠️">
            <p>
              Customers who encounter technical difficulties that prevent access to purchased digital content 
              may contact our Customer Support team at <strong>support@infinitocomics.com</strong> within 7 calendar days 
              of the purchase date. Acceptable issues for review include, but are not limited to:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Broken or corrupted digital files</li>
              <li>Non-functional access links</li>
              <li>Incorrect product delivered (e.g., wrong comic title)</li>
            </ul>
          </Section>

          <Section title="Resolution Process" icon="🛠️">
            <p>
              Upon receipt of a refund request, our support team will acknowledge the request within 48 business 
              hours. We may require additional information, such as screenshots, error messages, or 
              device/browser specifications, to verify the reported issue.
            </p>
            <p>
              Once the issue is verified, we will take one of the following actions:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Restore access to the correct product, or</li>
              <li>Issue a refund to the original payment method.</li>
            </ul>
          </Section>

          <Section title="Refund Timeline" icon="⏳">
            <p>
              Approved refunds will be processed within 7–10 business days following verification. Please note 
              that processing times may vary based on your bank, card issuer, or payment gateway.
            </p>
          </Section>

          <Section title="Non-Refundable Situations" icon="🚫">
            <p>Refunds will not be granted under the following circumstances:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>The request is submitted more than 7 days after the purchase date.</li>
              <li>Access issues arise from internet connectivity problems, device compatibility, or outdated software on the customer’s end.</li>
              <li>The customer has accessed and consumed the majority of the digital content but subsequently requests a refund due to dissatisfaction.</li>
            </ul>
          </Section>

          <Section title="Acknowledgement" icon="✅">
            <p>
              By purchasing from Infinito Comics, you acknowledge that you have read, understood, and agreed 
              to this Refund Policy. For any questions or concerns, please contact our Customer Support team.
            </p>
          </Section>

          <Section title="Contact Information" icon="📧">
            <p>
              Email: <strong>infinito.comics1@gmail.com</strong>
            </p>
          </Section>
        </div>

        {/* Footer Quote */}
        <motion.div
          className="pt-8 border-t text-center text-gray-600 italic text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          “We aim to make every purchase a satisfying one. If an issue arises, we are here to help.”
        </motion.div>
      </div>
    </div>
  );
};

export default RefundPolicy;
