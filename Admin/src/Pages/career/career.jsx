// Pages/career/career.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from './JobForm';
import JobList from './JobList';
import ConfirmationModal from './ConfirmationModal';
import { editJob, fetchJob,sendJob,removeJob } from '../../services/careerServices';

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
    </div>
  );
};

export default Career;