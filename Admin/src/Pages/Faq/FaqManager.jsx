import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Plus, HelpCircle } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import FaqForm from './FaqForm';
import FaqListSection from './FaqListSection';

import { getAllFaqs, addFaq, updateFaq, deleteFaq } from '../../services/faqService'; // adjust path accordingly

const FAQManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({ question: "", answer: "", order: "", category: "research", id: null });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const formRef = useRef(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await getAllFaqs();
      if (response.data.success && Array.isArray(response.data.data)) {
        setFaqs(response.data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      toast.error("Oops! Something went wrong while loading FAQs.", { toastId: "faq-fetch-failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const resetForm = () => {
    setForm({ question: "", answer: "", order: "", category: "research", id: null });
    setIsEditing(false);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const orderNumber = parseInt(form.order);

    if (!form.question.trim() || !form.answer.trim() || isNaN(orderNumber)) {
      setError("All fields are required and order must be a valid number.");
      return;
    }

    const isDuplicateOrder = faqs.some(
      faq => faq.order === orderNumber && faq.category === form.category && faq._id !== form.id
    );
    if (isDuplicateOrder) {
      setError("This order number already exists in the selected category.");
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await updateFaq(form.id, {
          question: form.question.trim(),
          answer: form.answer.trim(),
          order: orderNumber,
          category: form.category
        });
        toast.success("FAQ updated successfully!");
      } else {
        await addFaq({
          question: form.question.trim(),
          answer: form.answer.trim(),
          order: orderNumber,
          category: form.category
        });
        toast.success("FAQ added successfully!");
      }

      resetForm();
      fetchFaqs();
    } catch (err) {
      toast.error("Failed to save FAQ. Please try again.", { toastId: "faq-save-failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faq) => {
    setForm({
      id: faq._id,
      question: faq.question,
      answer: faq.answer,
      order: faq.order.toString(),
      category: faq.category || "research"
    });
    setIsEditing(true);
    setShowForm(true);
    setError("");
    setTimeout(() => window.scrollTo({ top: 100, behavior: 'smooth' }), 100);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      try {
        setLoading(true);
        await deleteFaq(id);
        toast.info("FAQ deleted successfully.");
        fetchFaqs();
      } catch (err) {
        toast.error("Failed to delete FAQ. Please try again.", { toastId: "faq-delete-failed" });
      } finally {
        setLoading(false);
      }
    }
  };

  const researchFaqs = faqs.filter(f => f.category === "research").sort((a, b) => a.order - b.order);
  const ultimateFaqs = faqs.filter(f => f.category === "ultimate").sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-28">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">FAQ Manager</h1>
          <p className="text-lg text-gray-600">Manage your frequently asked questions with ease</p>
        </div>

        {!showForm && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New FAQ
            </button>
          </div>
        )}

        {showForm && (
          <FaqForm
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            isEditing={isEditing}
            error={error}
            loading={loading}
          />
        )}

        {faqs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No FAQs Yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first FAQ</p>
          </div>
        ) : (
          <div className="space-y-8">
            <FaqListSection title="Research FAQs" list={researchFaqs} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
            <FaqListSection title="Ultimate FAQs" list={ultimateFaqs} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
          </div>
        )}
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
      </div>
    </div>
  );
};

export default FAQManager;
