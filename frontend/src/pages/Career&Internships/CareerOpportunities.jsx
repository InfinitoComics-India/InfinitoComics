// 📁 src/components/CareerOpportunities.jsx
import { useEffect, useState } from "react";
import {  departments, jobTypes } from "../../constants/career";
import { Link } from "react-router-dom";
import { fetchJob } from "../../services/CareerService";
import CareerOpportunitiesShimmer from '../../shimmer/Career/CareerOpportunitiesShimmer'

const CareerOpportunities = () => {
    const [loading, setLoading] = useState(true);
  

  useEffect(() => {
     setTimeout(() => setLoading(false), 2400); 
    const getData = async () => {
      try {
        const response = await fetchJob();

        //  Ensure the response format is valid
        const rawJobs = response?.data?.data;
        console.log(rawJobs)
        if (Array.isArray(rawJobs)) {
          const formattedJobs = rawJobs.map((job) => ({
            id:job._id,
            postDate:job.createdAt,
            title: job.jobtitle.trim(),
            description:job.description.trim(),
            department: job.department.trim(),
            jobType: job.jobtypes.trim(),
            positions: parseInt(job.position) || 1,

            tasks: Array.isArray(job.tasks) ? job.tasks : [], 
            skills: Array.isArray(job.skills) ? job.skills : [] 
          }));

          // Set formatted jobs
          setJobs(formattedJobs);


        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    getData();
  }, [])

  const [jobs, setJobs] = useState([]);
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedJobType, setSelectedJobType] = useState("All Job Types"); // State for job type filter

  // Filters job list based on selected department and job type
  const filteredJobs = jobs.filter((job) => {
    const matchDept =
      selectedDept === "All Departments" || job.department === selectedDept;
    const matchType =
      selectedJobType === "All Job Types" || job.jobType === selectedJobType;
    return matchDept && matchType;
  });

  return loading?<CareerOpportunitiesShimmer/>: (
    <div className="w-full md: py-8">
      {/* Page Header Section */}
      <div className="flex flex-col justify-center bg-gray-100 h-70 w-full items-center ">
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-8">
          Career opportunities
        </h1>
        <p className="text-center text-gray-900 mb-10 ">
          Explore our open roles for working totally remotely, from the office
          or somewhere in between.
        </p>
      </div>

      {/* Application Section - Main Wrapper */}
      <div className="bg-white mx-4 sm:mx-10 md:mx-20 lg:mx-40 xl:mx-60 -mt-12">
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center p-5 rounded mb-8 mx-4 sm:mx-10 md:mx-20">
          {/* Dropdowns for department and job type filtering */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <label className="font-semibold">Filter by</label>

            {/* Department Select Dropdown */}
            <select
              className="border p-2 rounded min-w-[180px]"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              {departments.map((dep) => (
                <option key={dep}>{dep}</option>
              ))}
            </select>

            {/* Job Type Select Dropdown */}
            <select
              className="border p-2 rounded min-w-[180px]"
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
            >
              {jobTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Display number of matched jobs */}
          <p className="mt-4 md:mt-0 text-sm text-gray-600">
            {filteredJobs.length} open positions
          </p>
        </div>

        {/* Job Listing Section */}
        <div className="w-full">
          {filteredJobs.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <span className="text-gray-500 text-lg font-semibold">No jobs available</span>
            </div>
          ) : (
            // Groups listings by department
            [...new Set(filteredJobs.map((job) => job.department))].map(
              (dept) => (
                <div key={dept} className="mb-10 mx-4 sm:mx-10 md:mx-20 lg:mx-40">
                  {/* Department Label */}
                  <div className="border-t relative mb-3">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 text-sm font-bold">
                      {dept}
                    </span>
                  </div>

                  {/* Jobs under each department */}
                  <div className="flex flex-col gap-4 mx-2 my-16">
                    {filteredJobs
                      .filter((job) => job.department === dept)
                      .map((job) => (
                        <div
                          key={job.id}
                          className="flex flex-row sm:flex-row gap-2 sm:gap-0 justify-between items-start sm:items-center px-4 md:px-10 my-2"
                        >
                          {/* Job Title */}
                          <div className="text-gray-700 font-medium w-full sm:w-64 truncate">
                            {job.title}
                          </div>
                          <div className="text-sm text-gray-500 w-full sm:w-40 text-left sm:text-center whitespace-nowrap">
                            {job.positions} positions
                          </div>
                          <div className="w-full sm:w-32 text-left sm:text-right">
                            <Link
                              to="/careers/apply"
                              state={{ job }}
                              className="text-blue-600 tracking-widest"
                            >
                              Apply {">"}
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerOpportunities;
             