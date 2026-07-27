import React, { useState, useEffect } from 'react';

const JobForm = ({ onSubmit, onSuccess, onCancel, initialData, isEditing = false }) => {
  const [formData, setFormData] = useState({
    jobtitle: '',
    department: '',
    jobtypes: 'Full-time',
    position: '1', // Keep as string to avoid input issues
    description: '',
    tasks: [''],
    skills: ['']
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Department options
  const departmentOptions = [
    '2D Animators',
    'UI/UX',
    'Human Resource',
    'Marketing',
    'Legal',
    'Finance',
    'Graphic Designer',
    'Management Trainees',
    'Web Developer'
  ];

  // Job type options
  const jobTypeOptions = [
    'Internship',
    'Full-time',
    'Freelancer'
  ];

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        jobtitle: initialData.jobtitle || '',
        department: initialData.department || '',
        jobtypes: initialData.jobtypes || 'Full-time',
        position: String(initialData.position || '1'), // Convert to string and ensure fallback
        description: initialData.description || '',
        tasks: Array.isArray(initialData.tasks) && initialData.tasks.length > 0 ? initialData.tasks : [''],
        skills: Array.isArray(initialData.skills) && initialData.skills.length > 0 ? initialData.skills : ['']
      });
    } else if (!isEditing) {
      // Reset form when not editing
      setFormData({
        jobtitle: '',
        department: '',
        jobtypes: 'Full-time',
        position: '1',
        description: '',
        tasks: [''],
        skills: ['']
      });
    }
  }, [initialData, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value // Keep all values as strings, convert only when needed
    }));
  };

  const handleArrayChange = (index, value, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.jobtitle.trim()) errors.push('Job title is required');
    if (!formData.department.trim()) errors.push('Department is required');
    if (!formData.jobtypes) errors.push('Job type is required');
    
    const positionNum = parseInt(formData.position);
    if (!formData.position || isNaN(positionNum) || positionNum < 1) {
      errors.push('Valid number of positions is required');
    }
    
    if (!formData.description.trim()) errors.push('Description is required');
    
    const validTasks = formData.tasks.filter(task => task.trim() !== '');
    if (validTasks.length === 0) errors.push('At least one task is required');
    
    const validSkills = formData.skills.filter(skill => skill.trim() !== '');
    if (validSkills.length === 0) errors.push('At least one skill is required');
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Filter out empty tasks and skills and convert position to string
      const cleanedData = {
        ...formData,
        position: String(formData.position), // Ensure position is string for backend
        tasks: formData.tasks.filter(task => task.trim() !== ''),
        skills: formData.skills.filter(skill => skill.trim() !== '')
      };

      const result = await onSubmit(cleanedData);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: isEditing ? 'Job updated successfully!' : 'Job created successfully!' 
        });
        
        if (!isEditing) {
          setFormData({
            jobtitle: '',
            department: '',
            jobtypes: 'Full-time',
            position: '1',
            description: '',
            tasks: [''],
            skills: ['']
          });
        }
        
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 1500);
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || `Failed to ${isEditing ? 'update' : 'create'} job` 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && onCancel) {
      onCancel();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Job' : 'Create New Job'}
          </h2>
          {isEditing && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Cancel Edit
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Job Title and Department Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="jobtitle"
                value={formData.jobtitle}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Frontend Developer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Job Type and Position Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type *
              </label>
              <select
                name="jobtypes"
                value={formData.jobtypes}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {jobTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Positions *
              </label>
              <input
                type="number"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 2"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the role and responsibilities..."
            />
          </div>

          {/* Tasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasks & Responsibilities *
            </label>
            {formData.tasks.map((task, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'tasks')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a task..."
                />
                {formData.tasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'tasks')}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('tasks')}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              Add Task
            </button>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills *
            </label>
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'skills')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a skill..."
                />
                {formData.skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'skills')}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('skills')}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              Add Skill
            </button>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4 space-x-3">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 
                (isEditing ? 'Updating...' : 'Creating...') : 
                (isEditing ? 'Update Job' : 'Create Job')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;