import React from 'react';

const JobList = ({ jobs = [], loading, onRefresh, onEditJob, onDeleteJob }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading jobs...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
            Job Listings ({Array.isArray(jobs) ? jobs.length : 0})
          </h2>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            Refresh
          </button>
        </div>

        {!Array.isArray(jobs) || jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">Start by creating your first job posting.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {jobs.map((job, index) => (
              <JobCard 
                key={job._id || job.id || index} 
                job={job} 
                onEdit={() => onEditJob(job)}
                onDelete={() => onDeleteJob(job)} // Just pass the job, no confirmation here
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const JobCard = ({ job, onEdit, onDelete }) => {
  if (!job) return null;

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
              {job.jobtitle || 'Untitled Job'}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {job.jobtypes || 'N/A'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {job.position || 0} {(parseInt(job.position) === 1) ? 'Position' : 'Positions'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Department:</span>
              <span className="ml-2 text-sm text-gray-900">{job.department || 'N/A'}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Created:</span>
              <span className="ml-2 text-sm text-gray-900">{formatDate(job.createdAt)}</span>
            </div>
          </div>

          <div className="mb-4">
            <span className="text-sm font-medium text-gray-600">Description:</span>
            <p className="mt-1 text-sm text-gray-700 leading-relaxed">{job.description || 'No description provided'}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
            {/* Tasks */}
            {job.tasks && Array.isArray(job.tasks) && job.tasks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Tasks & Responsibilities:</h4>
                <ul className="space-y-1">
                  {job.tasks.map((task, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2 mt-1">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills - Changed to bullets like tasks */}
            {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Required Skills:</h4>
                <ul className="space-y-1">
                  {job.skills.map((skill, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-green-500 mr-2 mt-1">•</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm font-medium transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobList;