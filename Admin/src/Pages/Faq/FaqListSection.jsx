import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

const FaqListSection = ({ title, list, onEdit, onDelete, loading }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">{title}</h2>
    {list.length === 0 ? (
      <div className="text-gray-600 italic mb-4">No FAQs available for this category yet.</div>
    ) : (
      list.map((faq) => (
        <div
          key={faq._id}
          className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group mb-4"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mr-3">
                    {faq.order}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                    {faq.question}
                  </h3>
                </div>
                <div className="ml-11">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  <p className="text-sm text-gray-500 mt-1">Category: {faq.category}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">Order: {faq.order}</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onEdit(faq)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(faq._id)}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

export default FaqListSection;
