
// export default PrivacyPolicy;
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PrivacyPolicyPDF from "../../../public/privacypolicy.pdf";


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

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold text-gray-900">
            🔒 Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mb-2 font-bold">
            Effective Date: 15th August, 2025
          </p>
          <p className="text-gray-700 text-lg">
            At Infinito Comics Private Limited ("Infinito Comics", "we", "us",
            or "our"), we value your trust and are committed to protecting the
            privacy of every individual who accesses or uses our website
            Infinito Comics and associated services. We understand the
            responsibility that comes with handling personal information,
            especially for our young readers and their families. This Privacy
            Policy outlines how we collect, use, store, process, and protect
            your personal data, in strict accordance with applicable Indian
            laws, including the Digital Personal Data Protection Act, 2023, the
            Information Technology Act, 2000, and the Information Technology
            (Reasonable Security Practices and Procedures and Sensitive Personal
            Data or Information) Rules, 2011.
          </p>
          <a
            href={PrivacyPolicyPDF}
            download
            className="inline-block mt-4 bg-[#FF2D2D] text-white px-4 py-2 rounded font-semibold text-sm hover:bg-red-700 transition"
          >
            Download Privacy Policy PDF
          </a>
        </motion.div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-red-600 font-medium border-b pb-2">
          <Link
            to="/"
            className="hover:underline transition-colors duration-300"
          >
            Home
          </Link>
          <span>›</span>
          <span className="text-black font-bold">Privacy Policy</span>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          <Section title="Purpose and Scope" icon="🎯">
            <p>
              This Privacy Policy governs all personal information collected
              through our website, including during account registration,
              content access, feedback, and parental control functions. It
              applies to all users — adults, children, and legal guardians — and
              aims to ensure transparency, user rights, and data security, while
              also providing an age-appropriate and safe experience for
              children.
            </p>
          </Section>

          <Section title="Legal Basis for Data Collection" icon="⚖️">
            <p>
              Our data collection practices are strictly governed by the Digital
              Personal Data Protection Act, 2023, which mandates lawful,
              transparent, and limited use of personal data. In the case of
              children, we comply with the Protection of Children from Sexual
              Offences (POCSO) Act, 2012, and the Juvenile Justice (Care and
              Protection of Children) Act, 2015, ensuring that no child’s
              personal information is collected or processed without verified
              parental consent.
            </p>
          </Section>

          <Section title="Information We Collect" icon="📋">
            <p>
              We collect personal information in a lawful and fair manner,
              either directly from users or their guardians, or automatically
              through their interactions with our platform. This includes:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>
                Personal Identification Data such as name, email address, phone
                number, age, gender, and parental contact information (for
                children under 18).
              </li>
              <li>
                Usage and Device Data such as IP address, browser type,
                operating system, access times, pages visited, and device
                identifiers.
              </li>
              <li>
                Interaction Data such as comments, feedback, community forum
                posts, and support queries.
              </li>
              <li>
                Parental Control Data including content preferences, usage
                settings, and monitoring activities submitted by parents or
                guardians.
              </li>
              <li>
                Cookies and Tracking Technologies to manage sessions, enable
                preferences, restrict inappropriate content for minors, and
                enhance user experience.
              </li>
            </ul>
          </Section>

          <Section title="Use of Your Data" icon="⚙️">
            <p>
              All personal information collected is used for clearly defined and
              legitimate purposes. These include:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>
                To create and manage user profiles, including restricted-access
                accounts for minors.
              </li>
              <li>
                To provide age-appropriate comics and media experiences, aligned
                with content classification policies.
              </li>
              <li>
                To enable communication through newsletters, account alerts, and
                important updates (with opt-out options).
              </li>
              <li>
                To enforce parental control settings and comply with parental
                monitoring requirements.
              </li>
              <li>
                To ensure the safety of children and vulnerable users, and
                report any harmful or abusive behavior to appropriate
                authorities in compliance with the POCSO Act and IT Act.
              </li>
              <li>
                To detect, prevent, and investigate violations of our Terms of
                Use, including content abuse, harassment, or other misconduct.
              </li>
              <li>
                To analyze user preferences and improve website functionality
                and security.
              </li>
            </ul>
            <p className="mt-2">
              We do not use children's data for behavioral advertising or
              profiling. All processing activities are subject to your (or your
              guardian’s) explicit and revocable consent.
            </p>
          </Section>

          <Section title="Parental Consent and Child Data Protection" icon="🛡️">
            <p>
              In accordance with Indian law, users below the age of 18 are
              considered minors. Access to certain features or services requires
              verified parental or guardian consent. We offer tools that allow
              parents to:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Approve or decline registration of their child.</li>
              <li>Monitor their child’s account activity.</li>
              <li>Set content restrictions and access time limits.</li>
              <li>
                Request correction or deletion of their child’s personal data.
              </li>
            </ul>
            <p>
              We take all necessary steps to protect children's data, including
              applying high standards of encryption and avoiding any form of
              unnecessary or invasive data collection.
            </p>
          </Section>

          <Section title="Data Sharing and Disclosure" icon="🔗">
            <p>
              We respect your privacy and never sell, rent, or trade personal
              information. We may only share your data:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>With verified parental consent (for users under 18).</li>
              <li>
                With third-party service providers (such as hosting, analytics,
                or customer support), under strict confidentiality and data
                protection agreements.
              </li>
              <li>
                When required by law, including compliance with court orders,
                law enforcement inquiries, or government directives under the IT
                Act, 2000.
              </li>
              <li>
                In connection with mergers, acquisitions, or legal
                restructuring, provided such transfers maintain your data
                protection rights.
              </li>
            </ul>
            <p>
              All shared data is subject to robust security protocols and
              limited access policies.
            </p>
          </Section>

          <Section title="Cookies and Tracking Technologies" icon="🍪">
            <p>
              Infinito Comics uses cookies and related technologies to enhance
              your experience and deliver age-appropriate content. Cookies help
              us:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Maintain session login and preferences.</li>
              <li>Provide customized navigation for children and adults.</li>
              <li>Prevent exposure to inappropriate content.</li>
              <li>Collect anonymous statistics for internal analytics.</li>
            </ul>
            <p>
              In accordance with Rule 5 of the Sensitive Personal Data or
              Information (SPDI) Rules under the IT Act, users are informed
              about the use of cookies, and can choose to accept or decline them
              using browser settings or our cookie management panel. Children’s
              cookies are minimal, non-invasive, and never used for advertising.
            </p>
          </Section>

          <Section title="Data Storage, Retention, and Security" icon="💾">
            <p>
              All personal data is stored on secure servers located within India
              or countries with equivalent data protection standards as approved
              by Indian authorities. We implement measures such as SSL
              encryption, firewalls, role-based access control, and periodic
              security audits to prevent unauthorized access or breaches.
            </p>
            <p>
              We retain personal data only for as long as necessary to fulfill
              the stated purposes or meet legal obligations. Inactive child
              accounts are reviewed periodically and may be deleted upon
              parental request.
            </p>
          </Section>

          <Section title="User Rights Under Indian Law" icon="📜">
            <p>
              As a data principal under the Digital Personal Data Protection
              Act, 2023, you have the right to:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Access the personal data held by us.</li>
              <li>Correct any inaccuracies in your data.</li>
              <li>Withdraw consent for any ongoing processing.</li>
              <li>Request deletion of your data.</li>
              <li>Be informed of data breaches affecting your information.</li>
              <li>
                File grievances with the Data Protection Board or our Grievance
                Officer.
              </li>
            </ul>
            <p>
              These rights may be exercised by sending a written request to the
              Grievance Officer listed below.
            </p>
          </Section>

          <Section title="Grievance Redressal and Contact" icon="📞">
            <p>
              In compliance with Rule 3(2) of the IT (Intermediary Guidelines
              and Digital Media Ethics Code) Rules, 2021, and the DPDP Act,
              2023, Infinito Comics has appointed a Grievance Officer to address
              all privacy-related concerns. We are committed to resolving all
              complaints within 15 business days of receipt.
            </p>
          </Section>

          <Section title="Updates to This Policy" icon="🔄">
            <p>
              This Privacy Policy may be updated periodically to reflect changes
              in technology, law, or business practices. All material changes
              will be notified on our website and, where appropriate, by email.
              We encourage users to review this policy regularly.
            </p>
          </Section>

          <Section title="Final Assurance" icon="🤝">
            <p>
              Infinito Comics is dedicated to creating a creative and respectful
              space that prioritizes safety, dignity, and transparency. By using
              our services, you entrust us with your information, and we commit
              to handling it with care, in full compliance with Indian legal
              standards.
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
          “Your trust is our priority. We are committed to protecting your
          privacy at every step.”
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
