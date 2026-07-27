import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
const TermsOfUsePDF = '/TermsofUse.pdf';

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

const TermsOfUse = () => {
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
          <h1 className="text-4xl font-bold text-gray-900">📜 Terms of Use</h1>
          <p className="text-sm text-gray-500 mb-2 font-bold">
            Effective Date: 15th August, 2025
          </p>
          <p className="text-gray-700 text-lg">
            These Terms of Use govern your use of the website and services offered by Infinito Comics Private Limited.
          </p>
          <a
            href={TermsOfUsePDF}
            download
            className="inline-block mt-4 bg-[#FF2D2D] text-white px-4 py-2 rounded font-semibold text-sm hover:bg-red-700 transition"
          >
            Download Terms of Use PDF
          </a>
        </motion.div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-red-600 font-medium border-b pb-2">
          <Link to="/" className="hover:underline transition-colors duration-300">Home</Link>
          <span>›</span>
          <span className="text-black font-bold">Terms of Use</span>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          <Section title="Introduction" icon="ℹ️">
            <p>
              Website: www.infinitocomics.com<br/>
              Operated by: Infinito Comics Private Limited<br/>
              Registered under the Companies Act, 2013
            </p>
            <p>
              These Terms of Use (“Terms”) govern your use of the website and services offered by Infinito Comics Private Limited (“Company”, “we”, “our”, “us”). By accessing or using our website, you agree to be bound by these Terms, our Privacy Policy, Cookie Policy, and Community Guidelines.
            </p>
            <p>If you do not agree with these Terms, you may not use this website.</p>
          </Section>

          <Section title="1. Eligibility" icon="✅">
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>You must be at least 18 years of age to access or register on this website independently.</li>
              <li>If you are under the age of 18, you may use the website only under the supervision and with the consent of a parent or legal guardian.</li>
              <li>By using this website, you confirm that you are legally competent to enter into a binding agreement as per the Indian Contract Act, 1872.</li>
            </ul>
          </Section>

          <Section title="2. Legal Compliance and Applicable Laws" icon="⚖️">
            <p>
              Infinito Comics is committed to providing a safe, inclusive, and lawful digital environment. The platform fully complies with applicable Indian laws, including but not limited to:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Information Technology Act, 2000</li>
              <li>Sections 66E, 67, 67A, 67B (offensive and obscene content)</li>
              <li>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</li>
              <li>Protection of Children from Sexual Offences (POCSO) Act, 2012</li>
              <li>Digital Personal Data Protection Act, 2023</li>
              <li>Indian Penal Code, 1860</li>
              <li>Sections 354A, 354D, 509 (sexual harassment, stalking)</li>
              <li>The Copyright Act, 1957</li>
              <li>The Trademarks Act, 1999</li>
              <li>The Indecent Representation of Women (Prohibition) Act, 1986</li>
              <li>The Juvenile Justice (Care and Protection of Children) Act, 2015</li>
            </ul>
          </Section>

          <Section title="3. Content Usage and Access" icon="📚">
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>All comics, illustrations, characters, logos, scripts, stories, and visual content are the intellectual property of Infinito Comics and are protected under Indian copyright and trademark laws.</li>
              <li>You may access the content for personal, non-commercial use. You may not reproduce, distribute, or modify any content without written permission; create derivative works; or publish the content elsewhere.</li>
              <li>Age-appropriate content is categorized and filtered to prevent exposure of minors to mature or sensitive material. Categories: G (General), PG (Parental Guidance), T (Teen).</li>
            </ul>
          </Section>

          <Section title="4. User Conduct" icon="🚫">
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Do not upload, publish, or share obscene, pornographic, harmful to minors, defamatory, offensive, or illegal content.</li>
              <li>Do not use the platform to harass, threaten, stalk, or harm others.</li>
              <li>Do not impersonate anyone or misrepresent your identity.</li>
              <li>Do not distribute spam, malware, or unauthorized advertising.</li>
            </ul>
            <p>Violations may result in suspension or termination and may be reported to authorities.</p>
          </Section>

          <Section title="5. Child Safety and Parental Controls" icon="🛡️">
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Accounts for minors require verified parental consent.</li>
              <li>Parents can set content restrictions, monitor activity, and request deletion of data.</li>
            </ul>
          </Section>

          <Section title="6. Data Protection and Privacy" icon="🔒">
            <p>
              We collect and process personal data in compliance with the Digital Personal Data Protection Act, 2023 and Section 43A of the IT Act, 2000.
            </p>
            <p>Users have the right to access, correct, withdraw consent, and request deletion of their data.</p>
          </Section>

          <Section title="7. Cookies and Tracking Technologies" icon="🍪">
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>We use cookies in compliance with the IT Rules, 2011.</li>
              <li>Cookies maintain sessions, improve functionality, and enable parental controls.</li>
              <li>Users can manage preferences via browser settings or our cookie panel.</li>
            </ul>
          </Section>

          <Section title="8. Community Features" icon="💬">
            <p>Users in community forums must follow our Code of Conduct. Moderators may delete content violating policies or laws.</p>
          </Section>

          <Section title="9. Account Suspension and Termination" icon="⛔">
            <p>We may suspend or terminate accounts for breaches, illegal content, or misconduct.</p>
          </Section>

          <Section title="10. Grievance Redressal" icon="📞">
            <p>
              In compliance with Rule 3(2) of the IT Rules, 2021, a Grievance Officer is appointed. All grievances will be addressed within 15 business days.
            </p>
          </Section>

          <Section title="11. Disclaimer and Limitation of Liability" icon="⚠️">
            <p>
              We are not liable for damages from use, errors, interruptions, or harm caused by user content. The site is provided “as is.”
            </p>
          </Section>

          <Section title="12. Governing Law and Jurisdiction" icon="📍">
            <p>
              These Terms are governed by the laws of India. All disputes fall under the exclusive jurisdiction of Indian courts.
            </p>
          </Section>

          <Section title="13. Updates and Amendments" icon="🔄">
            <p>
              We may amend these Terms periodically. Continued use signifies acceptance. Material changes will be communicated via email or website.
            </p>
          </Section>

          <Section title="14. Contact Us" icon="📧">
            <p>
              Infinito Comics Pvt. Ltd.<br/>
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
          “By using our platform, you agree to uphold a safe and respectful environment for all.”
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfUse;
