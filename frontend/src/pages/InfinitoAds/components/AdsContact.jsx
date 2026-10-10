import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../../utils/constants";

export default function AdsContact() {
  const [formData, setFormData] = useState({
    companyName: "",
    yourName: "",
    email: "",
    phone: "",
    industry: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/ads-inquiry`,
        formData
      );

      if (res.data?.success) {
        toast.success(
          res.data.message ||
            "Thank you! Your advertising inquiry was received."
        );

        setFormData({
          companyName: "",
          yourName: "",
          email: "",
          phone: "",
          industry: "",
          message: "",
        });
      } else {
        toast.error(res.data?.message || "Failed to submit inquiry.");
      }
    } catch (err) {
      console.error("AdsContact submit error:", err);

      toast.error(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact-form"
      className="w-full bg-white py-16 sm:py-20 text-gray-900 border-t border-gray-100"
    >
      <div className="w-full max-w-[1200px] mx-auto px-12 flex flex-col lg:flex-row gap-12 justify-between">
        {/* Left Side */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center">
          <span className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 block">
            L E T &rsquo; S &nbsp; B U I L D &nbsp; T O G E T H E R
          </span>

          <h2 className="text-3xl sm:text-4xl font-black uppercase leading-tight mb-4 text-black">
            READY TO BRING YOUR BRAND INTO THE STORY?
          </h2>

          <p className="text-gray-600 text-sm mb-8">
            Tell us about your brand and let&rsquo;s create something
            extraordinary.
          </p>

          <div>
            <a
              href="/characters"
              className="inline-block bg-[#d01824] hover:bg-[#b0131d] text-white px-6 py-3.5 text-xs uppercase font-bold tracking-wider transition shadow-sm rounded-xs"
            >
              EXPLORE THE CHARACTERS &gt;
            </a>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-7/12 bg-white border border-gray-200 p-6 sm:p-8 rounded-md shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d01824] rounded-xs"
              />

              <input
                type="text"
                name="yourName"
                placeholder="Your Name"
                value={formData.yourName}
                onChange={handleChange}
                required
                className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d01824] rounded-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d01824] rounded-xs"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Contact Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d01824] rounded-xs"
              />
            </div>

            <input
              type="text"
              name="industry"
              placeholder="Your Industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d01824] rounded-xs"
            />

            <textarea
              name="message"
              rows={4}
              placeholder="Tell us about your brand and ideas"
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d01824] rounded-xs"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-[#d01824] hover:bg-[#b0131d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 transition cursor-pointer shadow-sm rounded-xs"
            >
              {submitting ? "SENDING..." : "SEND MESSAGE >"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}