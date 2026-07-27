import React from 'react';
import { Save, X, AlertCircle, Plus, Edit3 } from 'lucide-react';

const FaqForm = ({ form, onChange, onSubmit, onCancel, isEditing, error, loading }) => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
    <div className="px-6 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-black flex items-center">
          {isEditing ? <Edit3 className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
          {isEditing ? "Edit FAQ" : "Add New FAQ"}
        </h2>
        <button onClick={onCancel} className="text-white hover:text-gray-200 transition-colors">
          <X className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>

    <form onSubmit={onSubmit} className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Question</label>
        <input
          type="text"
          name="question"
          value={form.question}
          onChange={onChange}
          placeholder="Enter your question here..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Answer</label>
        <textarea
          name="answer"
          value={form.answer}
          onChange={onChange}
          rows={4}
          placeholder="Provide a detailed answer..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Order</label>
        <input
          type="number"
          name="order"
          value={form.order}
          onChange={onChange}
          placeholder="1"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Order must be unique within each category</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
        <select
          name="category"
          value={form.category}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
        >
          <option value="research">Research</option>
          <option value="ultimate">Ultimate</option>
        </select>
      </div>

      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
        >
          <Save className="w-5 h-5 mr-2" />
          {loading ? "Saving..." : isEditing ? "Update FAQ" : "Add FAQ"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
);

export default FaqForm;
