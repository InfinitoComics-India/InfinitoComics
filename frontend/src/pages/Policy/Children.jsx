import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
const ChildPrivacyPDF = "/ChildrenPrivacyPolicy.pdf";

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

const ChildrensPrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold text-gray-900">🧒 Children’s Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-2 font-bold">
            Effective Date: 15th August, 2025
          </p>
          <p className="text-gray-700 text-lg">
            Issued by Infinito Comics Private Limited — We are committed to providing a safe, respectful, and legally compliant digital space for children and families.
          </p>
          <a
            href={ChildPrivacyPDF}
            download
            className="inline-block mt-4 bg-[#FF2D2D] text-white px-4 py-2 rounded font-semibold text-sm hover:bg-red-700 transition"
          >
            Download Children’s Privacy Policy PDF
          </a>
        </motion.div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-red-600 font-medium border-b pb-2">
          <Link to="/" className="hover:underline transition-colors duration-300">Home</Link>
          <span>›</span>
          <span className="text-black font-bold">Children’s Privacy Policy</span>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          <Section title="Scope and Binding Nature" icon="📜">
            <p>
              This Policy governs the collection, storage, usage, protection, and deletion of children’s data (under the age of 18) on the Infinito Comics website. 
              By accessing our platform, users (including parents, teachers, or legal guardians) acknowledge and accept that:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>This Policy is enforceable under the Indian Contract Act, 1872, and all data operations follow the Digital Personal Data Protection Act, 2023 (DPDPA) and Information Technology Act, 2000, especially Section 43A and Section 72A.</li>
              <li>The policy is binding on our company, directors, employees, and third-party contractors who interact with or process children's data.</li>
            </ul>
          </Section>

          <Section title="Strict Adherence to Indian Child Safety Laws" icon="⚖️">
            <p>We comply with and uphold multiple child safety laws, including:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Rule 4 of the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 — mandates removal of harmful content to children.</li>
              <li>POCSO Act, 2012 (Sections 11 & 12) — zero tolerance for sexually explicit or obscene content.</li>
              <li>Parental verification, content filtering, and data minimization under the DPDPA, 2023, and Juvenile Justice Act, 2015.</li>
            </ul>
          </Section>

          <Section title="Information We Collect" icon="📋">
            <p>We do not collect personal data from children without verified parental consent. Collected data may include:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>First name or screen name (non-identifiable)</li>
              <li>Age group (to provide age-appropriate content)</li>
              <li>Parent or guardian’s verified email and mobile number</li>
              <li>Behavioral data limited to reading progress (non-tracking, anonymized)</li>
              <li>IP address and device metadata for fraud prevention only (never shared)</li>
            </ul>
            <p>No biometric, financial, geolocation, or sensitive data is collected.</p>
          </Section>

          <Section title="Parental Consent and Oversight" icon="🛡️">
            <p>Consent is verified via OTP or digital signature. Parents can:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Approve or reject profile creation</li>
              <li>Access all stored data</li>
              <li>Delete their child’s data anytime</li>
              <li>Block specific content or limit screen time</li>
            </ul>
          </Section>

          <Section title="Prohibited Activities and Filters" icon="🚫">
            <p>We ban and filter the following:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Obscene, violent, sexual, or abusive content</li>
              <li>Inappropriate ads or links</li>
              <li>Interactions with unverified or adult users</li>
              <li>User-generated content without moderation</li>
            </ul>
            <p>AI filters, human moderators, and age-tagging enforce compliance, with breaches reported to authorities.</p>
          </Section>

          <Section title="Data Usage and Purpose Limitation" icon="🎯">
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Display personalized age-appropriate content</li>
              <li>Save story progress</li>
              <li>Support learning in a safe manner</li>
            </ul>
            <p>No child data is sold, profiled, or used for advertising.</p>
          </Section>

          <Section title="Data Retention and Deletion" icon="🗑️">
            <p>Data is stored for the shortest period necessary. Parents can request deletion by email. Requests are honored within 7 working days, with backups purged per IT Rules, 2011.</p>
          </Section>

          <Section title="Cookies and Tracking" icon="🍪">
            <p>We use only essential cookies for child accounts:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>No marketing or retargeting</li>
              <li>No sharing with third parties</li>
              <li>Settings visible in the parent dashboard</li>
            </ul>
          </Section>

          <Section title="Data Security and Grievance Redressal" icon="🔒">
            <p>We use AES-256 encryption, firewalls, and access logs. Breaches are handled by our Grievance Officer with resolution within 15 days, per IT Rules, 2021.</p>
          </Section>

          <Section title="Legal Disclosures and Compliance" icon="📜">
            <p>We cooperate with authorities including NCPCR, CERT-In, and Cyber Crime Division for abuse reports, vulnerability exploits, or prohibited content involving children.</p>
          </Section>

          <Section title="Accountability Statement" icon="📝">
            <blockquote className="italic">
              “This platform is governed and operated with a child-first approach. We have taken all technological, procedural, and legal steps mandated by Indian law to ensure that children are not subjected to harm, abuse, or privacy breaches.”
            </blockquote>
          </Section>

          <Section title="Updates to the Policy" icon="🔄">
            <p>This policy may be updated per legal changes or upgrades. Parents will be notified via email and public website logs.</p>
          </Section>
        </div>

        {/* Footer Quote */}
        <motion.div
          className="pt-8 border-t text-center text-gray-600 italic text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          “We protect children’s privacy with the highest legal and ethical standards.”
        </motion.div>
      </div>
    </div>
  );
};

export default ChildrensPrivacyPolicy;
