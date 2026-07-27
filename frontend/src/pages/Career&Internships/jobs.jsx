import React from "react";
import logo from "../../../assets/Logo.png";
import infinitoBanner from "../../../assets/Images/career/infinitoBanner.png"
import { useLocation } from "react-router-dom";
import { MapPin, Clock, Briefcase, Globe } from "lucide-react";



const Jobs = () => {
const location = useLocation();
const { job } = location.state || {}
console.log(job)
  return (
    <>
    <div
      className="flex justify-start items-center w-full h-80 bg-cover bg-center bg-no-repeat "
      style={{ backgroundImage: `url(${infinitoBanner})` }}
    >
         <h1 className="font-sans font-extrabold text-2xl sm:text-4xl text-red-600 tracking-[0.2em] scale-y-160 lg:mx-80 md:mx-80 mx-15">
            INFINITO COMICS
          </h1>
    </div>
    <div className="bg-[#f3f3f3] min-h-screen p-4 sm:p-6 md:p-15">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Content */}
        <div className="bg-white shadow-lg p-6 rounded-md lg:col-span-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col justify-between items-start gap-5">
              <h1 className="text-2xl font-bold">Graphic Design</h1>
              <button className="py-2 px-4 sm:py-3 sm:px-6 bg-[#dd1215] text-white text-xs sm:text-lg tracking-[3px] sm:tracking-[3px] mb-6">
         APPLY  &gt;
        </button>
            </div>

            <hr className="border-t border-gray-200" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg">
              <div className="flex items-center gap-2">
                <Globe size={20} />
               {job.jobType}
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={20} />
                {job.title}
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={28} />
                GE Road, Near Raj Kumar College, Raipur, Chhattisgarh 492001
              </div>
                <div className="flex items-center gap-2"> 
                  <Clock size={20} />
                  {(() => {
                    const rawDate = job?.postDate;
                    console.log('Raw postedDate:', rawDate);
                    if (rawDate) {
                      // Remove milliseconds and Z if present for robust parsing
                      const cleanedDate = rawDate.replace(/\.[0-9]+Z$/, '').replace(/Z$/, '');
                      const dateObj = new Date(cleanedDate);
                      console.log('Parsed dateObj:', dateObj);
                      return isNaN(dateObj.getTime())
                        ? 'Posted date not available'
                        : `Posted on ${dateObj.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`;
                    }
                    return 'Posted date not available';
                  })()}
                </div>
            </div>

            <div>
              <h2 className="text-blue-800 font-bold text-lg mt-4">Job Category</h2>
              <p className="text-lg text-gray-800">{job?.department}</p>
            </div>

            <div>
              <h2 className="text-blue-800 font-bold text-lg mt-4">Job Details</h2>
              <p className="text-lg text-gray-800 mt-2">
               {job?.description}
              </p>  
            </div>
            {/* skills */}
            <div >
              <h3 className="text-lg font-semibold mt-6">What you will be doing:</h3>
              <ul className="list-disc list-outside text-lg mt-2 text-gray-800 space-y-1 mx-4">
                    {Array.isArray(job?.tasks) && job.tasks.length > 0 ? (
                  job.tasks.map((task, idx) => (
                    <li key={idx}>{task}</li>
                  ))
                ) : (
                  <li>No tasks listed.</li>
                )}
              </ul>
            </div>
            {/* tasks */}
            <div>
              <h3 className="text-lg font-semibold mt-6">What you should have</h3>
              <ul className="list-disc list-outside text-lg mt-2 text-gray-800 space-y-1 mx-4">
                   {Array.isArray(job?.skills) && job.skills.length > 0 ? (
                  job.skills.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  ))
                ) : (
                  <li>No skills listed.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
   <div className="bg-white shadow-lg p-8 rounded-md h-fit self-start ">
  <h2 className="font-bold text-lg mb-4">About Us</h2>
    <div className="text-center mb-4 ">
            <img src={logo} alt="infinto" className="w-50 h-15 " />
          </div>
  <p className="text-lg font-semibold text-gray-800 mb-4">
    India's most prominent character based entertainment company with library of more than 2500+ superheroes. We are
    committed to bringing you the best in Comics, Animation, Games and merchandise.
  </p>
  <p className="text-lg text-gray-900 font-semibold">
    Discover our passion, expertise, and mission to revolutionise the world of AVGC–XR!
  </p>
</div>
      </div>
    </div>
    </>
  );
};

export default Jobs;
