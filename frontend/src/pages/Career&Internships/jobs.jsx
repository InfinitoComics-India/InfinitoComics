import React from "react";
import logo from "../../../assets/Logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Clock, Briefcase, Globe, ArrowLeft } from "lucide-react";
import careerUrls from "../../utils/imagesUrls/carrerUrls.js";

const Jobs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { job } = location.state || {};

  // Guard: if user lands here without a job in state, send them back to careers
  if (!job) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center gap-6 px-4">
        <h2 className="text-2xl font-bold text-gray-800">No job selected</h2>
        <p className="text-gray-600">Please browse open positions and click Apply.</p>
        <button
          onClick={() => navigate("/careers")}
          className="flex items-center gap-2 py-3 px-6 bg-[#dd1215] text-white text-sm tracking-widest hover:bg-red-700 transition-colors"
        >
          <ArrowLeft size={16} />
          BACK TO CAREERS
        </button>
      </div>
    );
  }

  // Format the posted date cleanly
  const formatDate = (rawDate) => {
    if (!rawDate) return "Posted date not available";
    const dateObj = new Date(rawDate);
    return isNaN(dateObj.getTime())
      ? "Posted date not available"
      : `Posted on ${dateObj.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`;
  };

  return (
    <>
      {/* Hero Banner */}
      <div
        className="flex justify-start items-center w-full h-72 sm:h-80 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${careerUrls.INFINITO_BANNER})` }}
      >
        <h1 className="font-sans font-extrabold text-2xl sm:text-4xl text-red-600 tracking-[0.2em] scale-y-110 px-6 sm:px-16 md:px-32 lg:px-60">
          INFINITO COMICS
        </h1>
      </div>

      {/* Back link */}
      <div className="bg-[#f3f3f3] px-4 sm:px-6 md:px-15 pt-6">
        <button
          onClick={() => navigate("/careers")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          Back to Careers
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-[#f3f3f3] min-h-screen p-4 sm:p-6 md:p-15 pt-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Content */}
          <div className="bg-white shadow-lg p-6 rounded-md lg:col-span-2">
            <div className="flex flex-col gap-4">

              {/* Title + Apply */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {job.department}
                  </span>
                </div>
                <button className="self-start sm:self-auto py-2 px-5 sm:py-3 sm:px-7 bg-[#dd1215] text-white text-xs sm:text-sm tracking-[3px] hover:bg-red-700 transition-colors whitespace-nowrap">
                  APPLY &gt;
                </button>
              </div>

              <hr className="border-t border-gray-200" />

              {/* Meta info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-gray-700">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-gray-400 shrink-0" />
                  <span>{job.jobType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-gray-400 shrink-0" />
                  <span>{job.positions} {job.positions === 1 ? "position" : "positions"} open</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                  <span>GE Road, Near Raj Kumar College, Raipur, Chhattisgarh 492001</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-gray-400 shrink-0" />
                  <span>{formatDate(job.postDate)}</span>
                </div>
              </div>

              {/* Job Details */}
              <div>
                <h2 className="text-blue-800 font-bold text-lg mt-4 mb-1">Job Details</h2>
                <p className="text-base text-gray-700 leading-relaxed">
                  {job.description}
                </p>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="text-lg font-semibold mt-4 mb-2">What you will be doing</h3>
                <ul className="list-disc list-outside text-base text-gray-700 space-y-1.5 pl-5">
                  {Array.isArray(job.tasks) && job.tasks.length > 0 ? (
                    job.tasks.map((task, idx) => <li key={idx}>{task}</li>)
                  ) : (
                    <li className="text-gray-400">No tasks listed.</li>
                  )}
                </ul>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold mt-4 mb-2">What you should have</h3>
                <ul className="list-disc list-outside text-base text-gray-700 space-y-1.5 pl-5">
                  {Array.isArray(job.skills) && job.skills.length > 0 ? (
                    job.skills.map((skill, idx) => <li key={idx}>{skill}</li>)
                  ) : (
                    <li className="text-gray-400">No skills listed.</li>
                  )}
                </ul>
              </div>

              {/* Bottom Apply */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button className="py-3 px-8 bg-[#dd1215] text-white text-sm tracking-[3px] hover:bg-red-700 transition-colors">
                  APPLY &gt;
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="bg-white shadow-lg p-8 rounded-md h-fit self-start sticky top-6">
            <h2 className="font-bold text-lg mb-4">About Us</h2>
            <div className="text-center mb-4">
              <img src={logo} alt="Infinito Comics" className="h-12 object-contain mx-auto" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              India's most prominent character-based entertainment company with a library of
              more than 2500+ superheroes. We are committed to bringing you the best in
              Comics, Animation, Games, and Merchandise.
            </p>
            <p className="text-sm text-gray-700 font-semibold leading-relaxed">
              Discover our passion, expertise, and mission to revolutionise the world of AVGC–XR!
            </p>

            {/* Quick job snapshot */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Role</span>
                <span className="font-medium text-gray-800 text-right max-w-[60%]">{job.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Department</span>
                <span className="font-medium text-gray-800">{job.department}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-800">{job.jobType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Openings</span>
                <span className="font-medium text-gray-800">{job.positions}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Jobs;
