import React, { useState, useEffect } from 'react';
import chat from '../../../assets/Images/Chat.png';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import {BASE_URL} from '../../utils/constants.js'

const ErrorPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    subject: '',
    customSubject: '',
    feedback: '',
  });

  const [isCustomSubject, setIsCustomSubject] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFormData((prev) => ({
          ...prev,
          email: user.email || '',
          name: user.name || '',
        }));
      } catch (e) {
        // Invalid user data
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubjectChange = (e) => {
    const selectedSubject = e.target.value;
    setFormData({
      ...formData,
      subject: selectedSubject,
      customSubject: selectedSubject === 'Custom' ? '' : formData.customSubject,
    });
    setIsCustomSubject(selectedSubject === 'Custom');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email: formData.email || '',
      name: formData.name || '',
      subject: formData.subject === 'Custom' ? (formData.customSubject || '') : (formData.subject || ''),
      feedback: formData.feedback || '',
    };

    try {
      const token = localStorage.getItem('authtoken');
      const response = await axios.post(`${BASE_URL}/api/feedback`, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      alert(response.data.message || 'Feedback submitted successfully!');
      setFormData({
        email: '',
        name: '',
        subject: '',
        customSubject: '',
        feedback: '',
      });
    } catch (error) {
      if (error.response && error.response.data) {
        alert('Error: ' + (error.response.data.message || 'submitting feedback'));
        console.error('Backend error:', error.response.data);
      } else {
        alert('Error submitting feedback');
        console.error(error);
      }
    }
  };

  return (
    <div className="flex gap-16 p-10 px-32 mx-auto max-w-7xl py-24">
      <div className="w-full md:w-1/2 space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <FaArrowLeft className="text-black" />
          <a href="/my-account" className="text-black text-xl font-bold">Back to My Account</a>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-red-700">
              Registered Mail*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly
              className="w-full p-3 border border-gray-300 bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">*This is where we’ll contact you if needed.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-red-700">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-red-700">
              Subject (Dropdown)
            </label>
            <select
              name="subject"
              id="subject"
              value={formData.subject}
              onChange={handleSubjectChange}
              className="w-full p-3 border border-gray-300"
            >
              <option value="">Please select what type of feedback you have</option>
              <option value="General">General</option>
              <option value="Complaint">Complaint</option>
              <option value="Suggestion">Suggestion</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          {isCustomSubject && (
            <div className="space-y-2">
              <input
                type="text"
                id="customSubject"
                name="customSubject"
                value={formData.customSubject}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300"
                placeholder="Enter your subject here..."
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium text-red-700">
              Describe the Error
            </label>
            <textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              placeholder="Tell us how you feel..."
              className="w-full p-3 border border-gray-300"
            ></textarea>
          </div>

          <div className="flex space-x-4 justify-end mt-4">
            <button
              type="reset"
              className="text-red-500 p-3 font-bold"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  subject: '',
                  customSubject: '',
                  feedback: '',
                }));
              }}
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="bg-red-500 text-white p-3 hover:bg-red-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Right Preview Section */}
      <div className="w-full md:w-1/2 bg-white p-8 shadow-md border border-gray-200 relative">
        <img
          src={chat}
          alt="Preview Image"
          className="absolute top-[-40px] right-[-40px] w-52 h-52 object-cover border-4 border-white"
        />
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Error Preview</h3>
          <div className="text-sm text-gray-700">
            <div className="mb-3">
              <strong>Registered Mail:</strong> {formData.email}
            </div>
            <div className="mb-3">
              <strong>Your Name:</strong> {formData.name}
            </div>
            <div className="mb-3">
              <strong>Subject:</strong> {formData.subject === 'Custom' ? formData.customSubject : formData.subject}
            </div>
            <div className="mb-3">
              <strong>Your Feedback:</strong> {formData.feedback}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
