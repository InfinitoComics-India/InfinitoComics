import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants.js";
import { MapPin, Mail, Phone, Send } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${BASE_URL}/api/feedback`, {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      setSubmitted(true);
      toast.success("Message sent! We'll get back to you soon.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <Toaster position="top-right" />

      {/* Hero */}
      <div className="bg-[#121212] py-16 px-4 text-center">
        <p className="text-[#DD1215] text-sm font-bold uppercase tracking-widest mb-2">Get In Touch</p>
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-wider">Contact Us</h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
          Have a question, feedback, or just want to say hi? We'd love to hear from you.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Left — Info */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Let's talk</h2>

          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-[#DD1215]" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm mb-1">Office</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Infinito Comics India Pvt. Ltd.<br />
                  Mumbai, Maharashtra, India
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Mail size={20} className="text-[#DD1215]" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm mb-1">Email</p>
                <a href="mailto:support@infinitohq.com" className="text-[#DD1215] text-sm hover:underline">
                  support@infinitohq.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Phone size={20} className="text-[#DD1215]" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm mb-1">Social</p>
                <div className="flex gap-3 flex-wrap mt-1">
                  {[
                    { label: "Instagram", url: "https://www.instagram.com/infinitoHQ/" },
                    { label: "Twitter/X", url: "https://x.com/InfinitoHQ" },
                    { label: "YouTube", url: "https://www.youtube.com/@InfinitoHQ" },
                  ].map(({ label, url }) => (
                    <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-bold text-gray-600 border border-gray-200 px-3 py-1 rounded hover:bg-gray-100 transition">
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Send a message</h2>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-gray-200 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <Send size={28} className="text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Message Sent!</h3>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Thanks for reaching out. Our team will get back to you within 24 hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                className="text-xs text-[#DD1215] font-bold uppercase tracking-widest hover:underline mt-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-[#DD1215] uppercase tracking-widest block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="Your name" required
                    className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215] transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#DD1215] uppercase tracking-widest block mb-1">
                    Email *
                  </label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="you@example.com" required
                    className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215] transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#DD1215] uppercase tracking-widest block mb-1">
                  Subject
                </label>
                <input
                  type="text" name="subject" value={form.subject} onChange={handleChange}
                  placeholder="What is this about?"
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215] transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#DD1215] uppercase tracking-widest block mb-1">
                  Message *
                </label>
                <textarea
                  name="message" value={form.message} onChange={handleChange}
                  placeholder="Tell us what's on your mind..." rows={5} required
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215] transition resize-none"
                />
              </div>

              <button
                type="submit" disabled={submitting}
                className="flex items-center justify-center gap-2 bg-[#DD1215] text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed self-start"
              >
                <Send size={14} />
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
