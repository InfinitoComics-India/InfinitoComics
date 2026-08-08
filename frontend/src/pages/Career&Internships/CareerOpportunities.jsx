import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { departments } from "../../constants/career";
import { Link } from "react-router-dom";
import { fetchJob } from "../../services/CareerService";
import CareerOpportunitiesShimmer from "../../shimmer/Career/CareerOpportunitiesShimmer";

// Careers page only shows Full-time and Freelancer — Internships live on /internships
const CAREER_JOB_TYPES = ["All Job Types", "Full-time", "Freelancer"];

const CareerOpportunities = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedJobType, setSelectedJobType] = useState("All Job Types");

  // Read ?type= from URL and pre-set the job type filter
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get("type");
    if (typeParam && CAREER_JOB_TYPES.includes(typeParam)) {
      setSelectedJobType(typeParam);
    }
  }, [location.search]);

  useEffect(() => {
    const shimmerTimer = setTimeout(() => setLoading(false), 2400);

    const getData = async () => {
      try {
        const response = await fetchJob();
        const rawJobs = response?.data?.data;
        if (Array.isArray(rawJobs)) {
          setJobs(rawJobs
            // Internship roles live on /internships — exclude them here
            .filter((job) => job.jobtypes?.trim() !== "Internship")
            .map((job) => ({
            id: job._id,
            postDate: job.createdAt,
            title: job.jobtitle.trim(),
            description: job.description.trim(),
            department: job.department.trim(),
            jobType: job.jobtypes.trim(),
            positions: parseInt(job.position) || 1,
            tasks: Array.isArray(job.tasks) ? job.tasks : [],
            skills: Array.isArray(job.skills) ? job.skills : [],
          })));
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setFetchError(true);
      }
    };

    getData();
    return () => clearTimeout(shimmerTimer);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchDept = selectedDept === "All Departments" || job.department === selectedDept;
    const matchType = selectedJobType === "All Job Types" || job.jobType === selectedJobType;
    return matchDept && matchType;
  });

  const filteredDepts = [...new Set(filteredJobs.map((job) => job.department))];

  if (loading) return <CareerOpportunitiesShimmer />;

  return (
    <div id="career-opportunities" className="w-full py-8 bg-gray-50">
      {/* Section header */}
      <div className="flex flex-col justify-center items-center text-center py-14 px-4">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4">Career Opportunities</h1>
        <p className="text-gray-600 max-w-xl">
          Explore our open roles — work remotely, from the office, or somewhere in between.
        </p>
      </div>

      {/* Card — constrained to same width as navbar */}
      <div className="w-full max-w-[1200px] mx-auto px-12">
        <div className="bg-white shadow-sm">

          {/* Filter bar */}
          <div className="flex flex-col md:flex-row justify-between items-center px-6 py-5 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <span className="font-semibold text-sm text-gray-700">Filter by</span>
              <select
                className="border border-gray-300 p-2 text-sm min-w-[180px] focus:outline-none focus:ring-2 focus:ring-red-500"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                aria-label="Filter by department"
              >
                {departments.map((dep) => <option key={dep} value={dep}>{dep}</option>)}
              </select>
              <select
                className="border border-gray-300 p-2 text-sm min-w-[180px] focus:outline-none focus:ring-2 focus:ring-red-500"
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                aria-label="Filter by job type"
              >
              {CAREER_JOB_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <p className="mt-4 md:mt-0 text-sm text-gray-500">
              {filteredJobs.length} {filteredJobs.length === 1 ? "open position" : "open positions"}
            </p>
          </div>

          {/* Job listings */}
          <div className="pb-8">
            {fetchError ? (
              <div className="flex flex-col justify-center items-center h-40 gap-2 text-center">
                <span className="text-red-500 text-lg font-semibold">Could not load jobs</span>
                <span className="text-gray-500 text-sm">Please check your connection and try again later.</span>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-40 gap-2">
                <span className="text-gray-500 text-lg font-semibold">No positions match your filters</span>
                <button
                  className="text-sm text-red-600 underline hover:text-red-700"
                  onClick={() => { setSelectedDept("All Departments"); setSelectedJobType("All Job Types"); }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredDepts.map((dept) => (
                <div key={dept} className="mb-10 px-6 mt-12">
                  {/* Department divider label */}
                  <div className="border-t border-gray-200 relative mb-3">
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red-600 text-white px-5 py-1 text-xs font-bold tracking-widest uppercase whitespace-nowrap">
                      {dept}
                    </span>
                  </div>

                  {/* Job rows */}
                  <div className="flex flex-col mt-10">
                    {filteredJobs.filter((job) => job.department === dept).map((job) => (
                      <div
                        key={job.id}
                        className="flex flex-row justify-between items-center px-4 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-gray-800 font-medium flex-1">{job.title}</div>
                        <div className="text-sm text-gray-500 w-32 text-center hidden sm:block">
                          {job.positions} {job.positions === 1 ? "position" : "positions"}
                        </div>
                        <div className="w-24 text-right">
                          <Link
                            to="/careers/apply"
                            state={{ job }}
                            className="text-blue-700 font-semibold text-sm tracking-widest uppercase hover:text-blue-900 transition-colors"
                          >
                            APPLY &rsaquo;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerOpportunities;
