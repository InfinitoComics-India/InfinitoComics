import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit, Trash2, FolderOpen, 
  Eye, EyeOff, Image as ImageIcon, Package, Grid, List
} from 'lucide-react';
import { 
  getAllCategories, 
  deleteCategory, 
  updateCategory 
} from '../../services/shopServices/categoryService';
import Swal from 'sweetalert2';

const AllCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [categories, searchTerm, statusFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllCategories();
      
      // Mock data for testing
      const mockCategories = [
        {
          _id: '1',
          name: 'T-Shirts',
          slug: 'tshirts',
          description: 'Comfortable and stylish t-shirts for all occasions',
          image: 'https://via.placeholder.com/300x200?text=T-Shirts',
          status: 'active',
          productCount: 24,
          displayOrder: 1,
          createdAt: '2024-01-15'
        },
        {
          _id: '2',
          name: 'Hoodies',
          slug: 'hoodies',
          description: 'Warm and cozy hoodies perfect for cold weather',
          image: 'https://via.placeholder.com/300x200?text=Hoodies',
          status: 'active',
          productCount: 18,
          displayOrder: 2,
          createdAt: '2024-01-16'
        },
        {
          _id: '3',
          name: 'Caps & Hats',
          slug: 'caps',
          description: 'Trendy caps and hats to complete your look',
          image: 'https://via.placeholder.com/300x200?text=Caps',
          status: 'active',
          productCount: 12,
          displayOrder: 3,
          createdAt: '2024-01-17'
        },
        {
          _id: '4',
          name: 'Accessories',
          slug: 'accessory',
          description: 'Various accessories to enhance your style',
          image: 'https://via.placeholder.com/300x200?text=Accessories',
          status: 'active',
          productCount: 32,
          displayOrder: 4,
          createdAt: '2024-01-18'
        },
        {
          _id: '5',
          name: 'Tote Bags',
          slug: 'totebags',
          description: 'Eco-friendly and stylish tote bags',
          image: 'https://via.placeholder.com/300x200?text=Tote-Bags',
          status: 'inactive',
          productCount: 8,
          displayOrder: 5,
          createdAt: '2024-01-19'
        }
      ];

      setCategories(response.data || mockCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      Swal.fire('Error', 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...categories];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cat => cat.status === statusFilter);
    }

    // Sort by display order
    filtered.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    setFilteredCategories(filtered);
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete Category?',
      html: `
        <p>Are you sure you want to delete <strong>${name}</strong>?</p>
        <p class="text-sm text-gray-600 mt-2">This action cannot be undone.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD1215',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteCategory(id);
        Swal.fire('Deleted!', 'Category has been deleted.', 'success');
        fetchCategories();
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire('Error', error.response?.data?.message || 'Failed to delete category', 'error');
      }
    }
  };

  const toggleStatus = async (category) => {
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    
    try {
      await updateCategory(category._id, { status: newStatus });
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Category is now ${newStatus}`,
        timer: 1500,
        showConfirmButton: false
      });
      fetchCategories();
    } catch (error) {
      console.error('Status toggle error:', error);
      Swal.fire('Error', 'Failed to update category status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your product categories and organization
          </p>
        </div>

        <button
          onClick={() => navigate('/shop/categories/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#DD1215] text-white rounded-lg hover:bg-red-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
          <span>Total: <strong>{categories.length}</strong></span>
          <span>Active: <strong>{categories.filter(c => c.status === 'active').length}</strong></span>
          <span>Inactive: <strong>{categories.filter(c => c.status === 'inactive').length}</strong></span>
        </div>
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your filters'
              : 'Get started by creating your first category'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => navigate('/shop/categories/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add First Category
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map(category => (
                <div
                  key={category._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
                >
                  {/* Category Image */}
                  <div className="relative h-48 bg-gray-100">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          category.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {category.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {category.description || 'No description'}
                    </p>

                    {/* Product Count */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Package className="w-4 h-4" />
                      <span>{category.productCount || 0} products</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/shop/categories/${category._id}`)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      
                      <button
                        onClick={() => toggleStatus(category)}
                        className={`px-3 py-2 rounded-lg transition text-sm font-medium ${
                          category.status === 'active'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={category.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {category.status === 'active' ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(category._id, category.name)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCategories.map(category => (
                    <tr key={category._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{category.name}</div>
                            <div className="text-sm text-gray-500">{category.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                          {category.description || 'No description'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="w-4 h-4" />
                          <span>{category.productCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                            category.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {category.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/shop/categories/${category._id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => toggleStatus(category)}
                            className={`p-2 rounded-lg transition ${
                              category.status === 'active'
                                ? 'text-gray-600 hover:bg-gray-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={category.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {category.status === 'active' ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete(category._id, category.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllCategories;
