import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, ShoppingBag, ShieldCheck, ShieldAlert, Search, Filter, 
  RefreshCw, CheckCircle2, XCircle, Mail, Building, UserCheck, 
  ArrowUpDown, ExternalLink, Sparkles
} from 'lucide-react';
import { Table, Switch, message, Popconfirm, Tag, Input, Select, Tooltip, Spin } from 'antd';
import { 
  fetchAllEmployeesWithShopStatus, 
  toggleEmployeeShopAccess,
  setShopAllowedEmployees,
  getShopAllowedEmployees
} from '../../services/shopServices/shopAccessService';

const { Search: AntSearch } = Input;
const { Option } = Select;

const ShopManagement = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [accessFilter, setAccessFilter] = useState('ALL');
  const [togglingEmail, setTogglingEmail] = useState(null);

  // Load all employees on mount
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const list = await fetchAllEmployeesWithShopStatus();
      setEmployees(list);
    } catch (err) {
      console.error('Failed to load employees:', err);
      message.error('Failed to load employee list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();

    // Listen for live access updates from other tabs
    let bc;
    try {
      bc = new BroadcastChannel('infinito_shop_access_channel');
      bc.onmessage = (e) => {
        if (e.data?.type === 'shop_access_updated') {
          const allowed = new Set(e.data.allowedEmails || []);
          setEmployees((prev) =>
            prev.map((emp) => {
              const em = String(emp.email || '').toLowerCase().trim();
              return { ...emp, shopAccess: allowed.has(em) };
            })
          );
        }
      };
    } catch {}

    return () => {
      if (bc) bc.close();
    };
  }, []);

  // Handle single employee toggle
  const handleToggleAccess = async (emp, checked) => {
    const email = String(emp.email || '').toLowerCase().trim();
    if (!email) return;

    setTogglingEmail(email);
    try {
      // Optimistic state update
      setEmployees((prev) =>
        prev.map((e) =>
          String(e.email || '').toLowerCase().trim() === email ? { ...e, shopAccess: checked } : e
        )
      );

      await toggleEmployeeShopAccess(emp, checked);

      if (checked) {
        message.success(`Granted Shop section access to ${emp.name} (${emp.email})`);
      } else {
        message.info(`Revoked Shop section access from ${emp.name}`);
      }
    } catch (err) {
      console.error('Toggle error:', err);
      message.error('Failed to update shop access');
      // Revert
      loadEmployees();
    } finally {
      setTogglingEmail(null);
    }
  };

  // Bulk Grant All filtered
  const handleBulkGrantAll = async () => {
    const currentAllowed = new Set(getShopAllowedEmployees());
    filteredEmployees.forEach((emp) => {
      const em = String(emp.email || '').toLowerCase().trim();
      if (em) currentAllowed.add(em);
    });
    const nextList = Array.from(currentAllowed);
    setShopAllowedEmployees(nextList);
    setEmployees((prev) =>
      prev.map((e) => {
        const em = String(e.email || '').toLowerCase().trim();
        return currentAllowed.has(em) ? { ...e, shopAccess: true } : e;
      })
    );
    message.success(`Shop section access granted to all selected employees.`);

    // Persist to backend for each employee
    try {
      await Promise.allSettled(
        filteredEmployees.map((emp) => toggleEmployeeShopAccess(emp, true))
      );
    } catch {}
  };

  // Bulk Revoke All filtered
  const handleBulkRevokeAll = async () => {
    const toRemove = new Set(filteredEmployees.map((e) => String(e.email || '').toLowerCase().trim()));
    const currentAllowed = getShopAllowedEmployees();
    const nextList = currentAllowed.filter((e) => !toRemove.has(e));
    setShopAllowedEmployees(nextList);
    setEmployees((prev) =>
      prev.map((e) => {
        const em = String(e.email || '').toLowerCase().trim();
        return toRemove.has(em) ? { ...e, shopAccess: false } : e;
      })
    );
    message.info(`Shop section access revoked for selected employees.`);

    // Persist to backend for each employee
    try {
      await Promise.allSettled(
        filteredEmployees.map((emp) => toggleEmployeeShopAccess(emp, false))
      );
    } catch {}
  };

  // Filter departments for dropdown
  const departmentOptions = useMemo(() => {
    const depts = new Set();
    employees.forEach((e) => {
      if (e.department) depts.add(e.department);
    });
    return Array.from(depts);
  }, [employees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        emp.name?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.employeeId?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q);

      const matchDept = departmentFilter === 'ALL' || emp.department === departmentFilter;

      const matchAccess =
        accessFilter === 'ALL' ||
        (accessFilter === 'GRANTED' && emp.shopAccess === true) ||
        (accessFilter === 'RESTRICTED' && !emp.shopAccess);

      return matchSearch && matchDept && matchAccess;
    });
  }, [employees, searchTerm, departmentFilter, accessFilter]);

  // Stats calculation
  const totalEmployees = employees.length;
  const grantedCount = employees.filter((e) => e.shopAccess === true).length;
  const restrictedCount = totalEmployees - grantedCount;

  // Table columns definition
  const columns = [
    {
      title: 'EMPLOYEE',
      key: 'employee',
      render: (_, record) => {
        const initials = (record.name || 'E')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            {record.avatar ? (
              <img
                src={record.avatar}
                alt={record.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 text-white font-black text-xs flex items-center justify-center shrink-0 border border-gray-300">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-bold text-gray-900 text-sm truncate flex items-center gap-2">
                <span>{record.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded">
                  {record.employeeId}
                </span>
              </div>
              <div className="text-xs text-gray-500 truncate">{record.designation || 'Company Staff'}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'EMAIL ID',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <div className="flex items-center gap-1.5 text-xs font-mono text-gray-700">
          <Mail size={13} className="text-gray-400 shrink-0" />
          <a href={`mailto:${email}`} className="hover:text-[#DD1215] transition truncate">
            {email}
          </a>
        </div>
      ),
    },
    {
      title: 'DEPARTMENT',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          <Building size={12} className="text-gray-400" />
          {dept || 'General'}
        </span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (st) => {
        const isActive = st === 'active';
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
              isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
            {st || 'Active'}
          </span>
        );
      },
    },
    {
      title: 'SHOP SECTION ACCESS',
      key: 'shopAccess',
      render: (_, record) => {
        const isToggling = togglingEmail === String(record.email || '').toLowerCase().trim();
        const hasAccess = record.shopAccess === true;

        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={hasAccess}
              loading={isToggling}
              onChange={(checked) => handleToggleAccess(record, checked)}
              style={{ backgroundColor: hasAccess ? '#DD1215' : '#d1d5db' }}
            />
            <span
              className={`text-xs font-bold transition-colors ${
                hasAccess ? 'text-emerald-700' : 'text-gray-400'
              }`}
            >
              {hasAccess ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Access Granted
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <XCircle size={13} className="text-gray-400" />
                  Restricted
                </span>
              )}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 max-w-[1300px] mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-red-100 text-[#DD1215] flex items-center justify-center">
              <ShoppingBag size={18} />
            </span>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase font-dmsans">
              Shop Staff Access Management
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Authorize which company employees have permission to view and manage the Shop section.
            Employees with toggled access can see products, inventory, orders, and marketing banners in their portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadEmployees}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-[#DD1215]' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Overview Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Total Company Staff</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalEmployees}</h3>
            <p className="text-[11px] text-gray-400">All registered employees</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-700 font-bold">Shop Access Granted</p>
            <h3 className="text-2xl font-black text-emerald-800 mt-0.5">{grantedCount}</h3>
            <p className="text-[11px] text-emerald-600">Active shop managers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Access Restricted</p>
            <h3 className="text-2xl font-black text-gray-700 mt-0.5">{restrictedCount}</h3>
            <p className="text-[11px] text-gray-400">Shop section hidden on portal</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center">
            <ShieldAlert size={22} />
          </div>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search by name, email, or designation..."
              prefix={<Search size={15} className="text-gray-400 mr-1" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              className="rounded-lg"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Department Filter */}
            <Select
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: 160 }}
              className="rounded-lg"
            >
              <Option value="ALL">All Departments</Option>
              {departmentOptions.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>

            {/* Access Status Filter */}
            <Select
              value={accessFilter}
              onChange={setAccessFilter}
              style={{ width: 160 }}
              className="rounded-lg"
            >
              <Option value="ALL">All Permissions</Option>
              <Option value="GRANTED">Access Granted</Option>
              <Option value="RESTRICTED">Restricted</Option>
            </Select>

            {/* Quick Batch Actions */}
            <Popconfirm
              title="Grant Access to Filtered"
              description={`Grant shop access to all ${filteredEmployees.length} filtered employee(s)?`}
              onConfirm={handleBulkGrantAll}
              okText="Grant All"
              cancelText="Cancel"
            >
              <button
                type="button"
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Grant All
              </button>
            </Popconfirm>

            <Popconfirm
              title="Revoke Access for Filtered"
              description={`Revoke shop access from all ${filteredEmployees.length} filtered employee(s)?`}
              onConfirm={handleBulkRevokeAll}
              okText="Revoke All"
              cancelText="Cancel"
            >
              <button
                type="button"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Revoke All
              </button>
            </Popconfirm>
          </div>
        </div>
      </div>

      {/* ── Employees Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey={(record) => record.email || record.id}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Total ${total} employees`,
          }}
          locale={{
            emptyText: (
              <div className="py-12 text-center text-gray-400">
                <Users size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">No employees found matching the filters.</p>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
};

export default ShopManagement;
