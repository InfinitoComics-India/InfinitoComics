import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AntiHarassmentPDF from "../../../public/AntiHarrasmentPolicy.pdf"


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

const AntiHarassmentPolicy = () => {
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
          <h1 className="text-4xl font-bold text-gray-900">🚫 Anti-Harassment Policy</h1>
          <p className="text-sm text-gray-500 mb-2 font-bold">
            Effective Date: 15th August, 2025
          </p>
          <p className="text-gray-700 text-lg">
            Issued by Infinito Comics Private Limited — We are committed to creating a safe, inclusive, and respectful online environment for women and children.
          </p>
          <a
  href={AntiHarassmentPDF}
  download
  className="inline-block mt-4 bg-[#FF2D2D] text-white px-4 py-2 rounded font-semibold text-sm hover:bg-red-700 transition"
>
  Download Anti-Harassment Policy PDF
</a>
        </motion.div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-red-600 font-medium border-b pb-2">
          <Link to="/" className="hover:underline transition-colors duration-300">Home</Link>
          <span>›</span>
          <span className="text-black font-bold">Anti-Harassment Policy</span>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          <Section title="Our Commitment" icon="🤝">
            <p>
              At Infinito Comics, we are firmly committed to creating and maintaining a safe, inclusive, and respectful online environment for all users, especially children and women, who are often the most vulnerable to online abuse and harassment.
            </p>
            <p>
              This policy outlines the preventive, protective, and punitive measures we have adopted to comply with and uphold Indian laws such as:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>The Protection of Children from Sexual Offences Act (POCSO), 2012</li>
              <li>The Information Technology Act, 2000 (Sections 66E, 67, 67A, 67B)</li>
              <li>The Digital Personal Data Protection Act, 2023</li>
              <li>The Sexual Harassment of Women at Workplace Act, 2013</li>
              <li>IPC Sections 354A, 354D, 509</li>
              <li>The Juvenile Justice (Care and Protection of Children) Act, 2015</li>
            </ul>
          </Section>

          <Section title="Definition of Harassment" icon="📜">
            <p>Harassment includes but is not limited to:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Verbal or written abuse</li>
              <li>Cyberbullying, stalking, trolling, or threats based on gender or age</li>
              <li>Inappropriate language, sexual innuendo, obscene content, or gestures</li>
              <li>Unsolicited contact or grooming of minors</li>
              <li>Defamation, body shaming, or humiliation</li>
              <li>Sharing offensive or violent content targeting children or women</li>
            </ul>
          </Section>

          <Section title="Zero Tolerance for Child Harassment" icon="🛡️">
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Sexual or emotional exploitation of minors</li>
              <li>Contacting or befriending children via our platform</li>
              <li>Using content in a sexualized or abusive way</li>
              <li>Uploading fan art or stories violating child safety norms</li>
              <li>Creating or sharing inappropriate fantasies involving minors</li>
            </ul>
            <p>Offenders will be reported to Cyber Crime Cell, Childline 1098, and law enforcement per IT Act & POCSO.</p>
          </Section>

          <Section title="Protection of Women" icon="👩">
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Moderating all user content with AI and human review</li>
              <li>Blocking profiles using gender-based slurs or sexual language</li>
              <li>Protecting female staff under the POSH Act, 2013</li>
              <li>Penalizing sexist behavior or misogynistic submissions</li>
              <li>Providing anonymity, opt-outs, and reporting tools</li>
            </ul>
          </Section>

          <Section title="Platform Features for Safety" icon="🛠️">
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Pre-upload screening of content</li>
              <li>Auto-flagging abusive language</li>
              <li>Child-only zones with no open chat</li>
              <li>Content filters and blocklists for female users</li>
              <li>Parental controls for communications and privacy</li>
            </ul>
          </Section>

          <Section title="Reporting & Redressal" icon="📞">
            <p>All harassment reports will be:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Acknowledged within 24 hours</li>
              <li>Investigated within 7 working days</li>
              <li>Resolved per IT Rules, 2021</li>
              <li>Escalated to authorities if needed</li>
            </ul>
            <p>Victims can also report to:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><a href="https://cybercrime.gov.in" className="text-red-600 underline">Cyber Crime Portal</a></li>
              <li><a href="https://ncw.nic.in" className="text-red-600 underline">National Commission for Women</a></li>
              <li><a href="https://ncpcr.gov.in" className="text-red-600 underline">National Commission for Protection of Child Rights</a></li>
            </ul>
          </Section>

          <Section title="Penalties for Violators" icon="⚠️">
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Account suspension or ban</li>
              <li>Reporting to law enforcement</li>
              <li>Civil and criminal liability</li>
              <li>Public notification if required</li>
            </ul>
          </Section>

          <Section title="Education & Awareness" icon="📚">
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Moderator and staff training</li>
              <li>User education on safety</li>
              <li>Comics promoting anti-bullying and gender equality</li>
            </ul>
          </Section>

          <Section title="Internal Oversight" icon="👥">
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Grievance Redressal Team</li>
              <li>POSH Internal Complaints Committee</li>
              <li>Child Protection Committee</li>
            </ul>
          </Section>

          <Section title="Legal Disclaimer & Enforcement" icon="📜">
            <p>
              Infinito Comics reserves the right to amend this policy to remain compliant with Indian laws. All users agree to this policy upon accessing our services. Non-compliance may invite legal action.
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
          “We stand against harassment in all its forms and protect our community.”
        </motion.div>
      </div>
    </div>
  );
};

export default AntiHarassmentPolicy;
