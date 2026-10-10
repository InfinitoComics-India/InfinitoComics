// Pages/career/career.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from './JobForm';
import JobList from './JobList';
import ConfirmationModal from './ConfirmationModal';
import { editJob, fetchJob, sendJob, removeJob, fetchApplications, removeApplication, downloadApplicationsExcel } from '../../services/careerServices';

const Career = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [error, setError] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Applications state
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState(null);
  const [showDeleteAppModal, setShowDeleteAppModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [isDeletingApp, setIsDeletingApp] = useState(false);

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchJob()
      const result = response.data;
      const jobsData = result.success && result.data ? result.data : [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs. Please check if the server is running.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new job
  const createJob = async (jobData) => {
    try {
      setError(null);
      const response = await sendJob(jobData)
      const result = response.data;
      const newJob = result.data || result;
      setJobs(prevJobs => [...prevJobs, newJob]);
      return { success: true };
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job. Please try again.');
      return { success: false, error: error.message };
    }
  }; 

  // Update job
  const updateJob = async (jobId, jobData) => {
    try {
      setError(null);
      const response = await editJob(jobId,jobData);
          
      const result = response.data;
      const updatedJob = result.data || result;
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job._id === jobId ? updatedJob : job
        )
      );
      return { success: true };
    } catch (error) {
      console.error('Error updating job:', error);
      setError('Failed to update job. Please try again.');
      return { success: false, error: error.message };
    }
  };

  // Delete job
  const deleteJob = async (jobId) => {
    try {
      setIsDeleting(true);
      setError(null);
      const res = await removeJob(jobId);
      setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch applications
  const fetchAllApplications = async () => {
    try {
      setAppsLoading(true);
      setAppsError(null);
      const response = await fetchApplications();
      const data = response.data?.data || [];
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setAppsError('Failed to fetch applications. Please try again.');
    } finally {
      setAppsLoading(false);
    }
  };

  // Handle delete application flow
  const handleDeleteApp = (app) => {
    setAppToDelete(app);
    setShowDeleteAppModal(true);
  };

  const confirmDeleteApp = async () => {
    if (!appToDelete) return;
    try {
      setIsDeletingApp(true);
      await removeApplication(appToDelete._id);
      setApplications(prev => prev.filter(a => a._id !== appToDelete._id));
      setShowDeleteAppModal(false);
      setAppToDelete(null);
    } catch (err) {
      console.error('Error deleting application:', err);
    } finally {
      setIsDeletingApp(false);
    }
  };

  const cancelDeleteApp = () => {
    setShowDeleteAppModal(false);
    setAppToDelete(null);
  };

  // Handle edit job
  const handleEditJob = (job) => {
    setEditingJob(job);
    setActiveTab('create');
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingJob(null);
  };

  // Handle delete job - show confirmation modal
  const handleDeleteJob = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  // Confirm delete job
  const confirmDeleteJob = async () => {
    if (jobToDelete) {
      const result = await deleteJob(jobToDelete._id);
      if (result.success) {
        setShowDeleteModal(false);
        setJobToDelete(null);
        // Optionally show success message
      }
    }
  };

  // Cancel delete job
  const cancelDeleteJob = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  useEffect(() => {
    fetchJobs();
    fetchAllApplications();
  }, []);

  // Error boundary fallback
  if (error && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchJobs();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Career Management</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 hidden sm:block">Admin Dashboard</span>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && jobs.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('create');
                if (!editingJob) setEditingJob(null);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {editingJob ? 'Edit Job' : 'Create Job'}
            </button>
            <button
              onClick={() => {
                setActiveTab('list');
                setEditingJob(null);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Job List ({jobs.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('applications');
                setEditingJob(null);
                fetchAllApplications();
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Applications ({applications.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'create' && (
          <JobForm 
            onSubmit={editingJob ? 
              (jobData) => updateJob(editingJob._id, jobData) : 
              createJob
            }
            onSuccess={() => {
              setActiveTab('list');
              setEditingJob(null);
            }}
            onCancel={editingJob ? handleCancelEdit : undefined}
            initialData={editingJob}
            isEditing={!!editingJob}
          />
        )}
        {activeTab === 'list' && (
          <JobList 
            jobs={jobs} 
            loading={loading} 
            onRefresh={fetchJobs}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
          />
        )}
        {activeTab === 'applications' && (
          <div>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-semibold text-gray-800">
                All Applications
                <span className="ml-2 text-sm font-normal text-gray-500">({applications.length} total)</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={fetchAllApplications}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Refresh
                </button>
                <button
                  onClick={downloadApplicationsExcel}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Excel
                </button>
              </div>
            </div>

            {/* Error */}
            {appsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {appsError}
              </div>
            )}

            {/* Loading */}
            {appsLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-base font-medium">No applications yet</p>
                <p className="text-sm mt-1">Applications submitted via the website will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["#", "Applied On", "Name", "Email", "Phone", "Job Title", "Type", "Resume", "Status", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {applications.map((app, idx) => (
                      <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{app.fullName}</td>
                        <td className="px-4 py-3 text-gray-600">{app.email}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{app.phone || "—"}</td>
                        <td className="px-4 py-3 text-gray-800 whitespace-nowrap font-medium">{app.jobTitle}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {app.jobType || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate" title={app.resumeFileName}>
                          {app.resumeFileName || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                            ${app.status === "pending"     ? "bg-yellow-50 text-yellow-700" :
                              app.status === "reviewed"    ? "bg-blue-50 text-blue-700" :
                              app.status === "shortlisted" ? "bg-green-50 text-green-700" :
                                                            "bg-red-50 text-red-700"}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteApp(app)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete application"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteJob}
        onConfirm={confirmDeleteJob}
        title="Delete Job"
        message={
          jobToDelete ? (
            <span>
              Are you sure you want to delete the job <strong>"{jobToDelete.jobtitle}"</strong>? 
              <br /><br />
              This action cannot be undone and will permanently remove this job.  
            </span>
          ) : "Are you sure you want to delete this job?"
        }
        confirmText={isDeleting ? "Deleting..." : "Delete Job"}
        cancelText="Cancel"
        type="danger"
      />

      {/* Delete Application Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteAppModal}
        onClose={cancelDeleteApp}
        onConfirm={confirmDeleteApp}
        title="Delete Application"
        message={
          appToDelete ? (
            <span>
              Are you sure you want to delete the application from <strong>"{appToDelete.fullName}"</strong>?
              <br /><br />
              This action cannot be undone.
            </span>
          ) : "Are you sure you want to delete this application?"
        }
        confirmText={isDeletingApp ? "Deleting..." : "Delete Application"}
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Career;