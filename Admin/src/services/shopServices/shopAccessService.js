import axios from 'axios';
import { getAllEmployees, updateEmployee } from '../hrServices';
import { BACKEND_URL } from '../../Utils/constant';

const STORAGE_KEY = 'infinito_shop_allowed_employees';
const CHANNEL_NAME = 'infinito_shop_access_channel';

/**
 * Get list of employee emails who have granted access to the Shop section
 */
export const getShopAllowedEmployees = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((e) => String(e).toLowerCase().trim());
    }
  } catch {}
  return [];
};

/**
 * Save list of employee emails allowed to access Shop
 */
export const setShopAllowedEmployees = (emails) => {
  try {
    const clean = Array.from(new Set(emails.map((e) => String(e).toLowerCase().trim())));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    notifyAccessChange({ type: 'shop_access_updated', allowedEmails: clean });
    return clean;
  } catch (err) {
    console.error('Error saving shop allowed employees:', err);
    return emails;
  }
};

/**
 * Check if a particular employee email is authorized for Shop access
 */
export const isEmployeeShopAllowed = (email, adminObj = null) => {
  if (!email && !adminObj) return false;
  
  // Superadmin and shop_admin always have full shop access
  const roles = adminObj?.roles || (adminObj?.role ? [adminObj.role] : []);
  if (roles.includes('superadmin') || roles.includes('shop_admin')) {
    return true;
  }

  // Check direct shopAccess property if present on user object
  if (adminObj?.shopAccess === true) return true;

  const targetEmail = String(email || adminObj?.email || '').toLowerCase().trim();
  if (!targetEmail) return false;

  const allowed = getShopAllowedEmployees();
  return allowed.includes(targetEmail);
};

/**
 * Fetch live Shop access status for the currently logged in user from backend
 */
export const fetchMyCurrentShopAccess = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    const res = await axios.get(`${BACKEND_URL}/admin/me/shop-access`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const access = Boolean(res?.data?.data?.shopAccess);
    const email = String(res?.data?.data?.email || '').toLowerCase().trim();

    // Update stored Admin object with latest shopAccess
    const adminRaw = localStorage.getItem('Admin');
    if (adminRaw) {
      try {
        const parsedAdmin = JSON.parse(adminRaw);
        parsedAdmin.shopAccess = access;
        localStorage.setItem('Admin', JSON.stringify(parsedAdmin));
      } catch {}
    }

    // Update local allowed employee cache
    if (email) {
      const current = getShopAllowedEmployees();
      let next;
      if (access) {
        next = Array.from(new Set([...current, email]));
      } else {
        next = current.filter((e) => e !== email);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    notifyAccessChange({ type: 'shop_access_updated', email, shopAccess: access });
    return access;
  } catch (err) {
    console.warn('Live shop access check warning:', err.message);
    const curAdmin = JSON.parse(localStorage.getItem('Admin') || '{}');
    return isEmployeeShopAllowed(curAdmin?.email, curAdmin);
  }
};

/**
 * Broadcast access change across tabs
 */
export const notifyAccessChange = (payload) => {
  try {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.postMessage(payload);
    setTimeout(() => bc.close(), 100);
  } catch {}
};

/**
 * Toggle shop access for an individual employee
 */
export const toggleEmployeeShopAccess = async (employee, grant) => {
  const email = String(employee.email || '').toLowerCase().trim();
  const empId = employee._id || employee.id;
  const token = localStorage.getItem('authToken');

  // 1. Update local storage list immediately
  const current = getShopAllowedEmployees();
  let next = [];
  if (grant) {
    next = Array.from(new Set([...current, email]));
  } else {
    next = current.filter((e) => e !== email);
  }
  setShopAllowedEmployees(next);

  // 2. Call dedicated backend endpoint to persist across Admin & Employee collections
  try {
    await axios.patch(
      `${BACKEND_URL}/admin/shop-access/toggle`,
      {
        email,
        shopAccess: Boolean(grant),
        employeeId: empId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } catch (err) {
    console.warn('Backend admin shop-access toggle warning:', err.message);
  }

  // 3. Also update Employee HR document if empId exists
  if (empId) {
    try {
      await updateEmployee(empId, { shopAccess: Boolean(grant) });
    } catch (e) {
      console.warn('Backend updateEmployee shopAccess warning:', e.message);
    }
  }

  // 4. If current admin is the one toggled, update local Admin object
  const curAdmin = JSON.parse(localStorage.getItem('Admin') || '{}');
  if (String(curAdmin?.email || '').toLowerCase().trim() === email) {
    curAdmin.shopAccess = Boolean(grant);
    localStorage.setItem('Admin', JSON.stringify(curAdmin));
  }

  notifyAccessChange({ type: 'shop_access_updated', email, shopAccess: Boolean(grant) });
  return next;
};

/**
 * Fetch all employees from both HR and Admin sources, deduplicate, and attach shopAccess status
 */
export const fetchAllEmployeesWithShopStatus = async () => {
  const allowedEmails = new Set(getShopAllowedEmployees());
  let employeeList = [];

  // 1. Fetch from HR employee database
  try {
    const hrRes = await getAllEmployees({ all: true });
    const hrData = hrRes?.data?.data || hrRes?.data || [];
    if (Array.isArray(hrData)) {
      employeeList = hrData.map((emp) => {
        const em = String(emp.email || '').toLowerCase().trim();
        const hasAccess = emp.shopAccess === true || allowedEmails.has(em);
        if (emp.shopAccess === true && em) allowedEmails.add(em);
        return {
          id: emp._id || emp.id,
          employeeId: emp.employeeId || 'EMP',
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee',
          email: emp.email || '',
          department: emp.department || 'Operations',
          designation: emp.designation || 'Staff',
          hrRole: emp.hrRole || 'employee',
          status: emp.status || 'active',
          avatar: emp.avatar || '',
          shopAccess: hasAccess,
          source: 'hr',
        };
      });
    }
  } catch (err) {
    console.warn('Could not fetch HR employees, trying admin fallback:', err.message);
  }

  // 2. Fetch from Admin users (all registered admin/employee accounts)
  try {
    const token = localStorage.getItem('authToken');
    const adminRes = await axios.get(`${BACKEND_URL}/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const admins = adminRes?.data?.data || [];
    if (Array.isArray(admins)) {
      admins.forEach((adm) => {
        const em = String(adm.email || '').toLowerCase().trim();
        const existingIdx = employeeList.findIndex((e) => String(e.email).toLowerCase().trim() === em);
        const roles = adm.roles || (adm.role ? [adm.role] : []);
        const hasAccess = adm.shopAccess === true || roles.includes('shop_admin') || allowedEmails.has(em);

        if (existingIdx >= 0) {
          // Merge admin roles
          employeeList[existingIdx].shopAccess = employeeList[existingIdx].shopAccess || hasAccess;
          employeeList[existingIdx].roles = roles;
        } else {
          // Add as employee entry
          employeeList.push({
            id: adm._id || adm.id,
            employeeId: 'ADM-' + (adm._id ? adm._id.slice(-4) : 'USER'),
            firstName: adm.name || '',
            lastName: '',
            name: adm.name || adm.email?.split('@')[0] || 'Staff Member',
            email: adm.email,
            department: roles.includes('superadmin') ? 'Executive' : 'Operations',
            designation: roles.includes('superadmin') ? 'Super Admin' : (roles[0] || 'Employee'),
            hrRole: roles.includes('superadmin') ? 'superadmin' : 'employee',
            status: 'active',
            avatar: '',
            shopAccess: hasAccess,
            roles: roles,
            source: 'admin',
          });
        }
      });
    }
  } catch (err) {
    console.warn('Could not fetch Admin accounts:', err.message);
  }

  // Sync back any newly discovered true accesses to localStorage
  const finalAllowed = Array.from(allowedEmails);
  if (finalAllowed.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalAllowed));
    } catch {}
  }

  return employeeList;
};

/**
 * Check Cloudinary status from backend
 */
export const checkCloudinaryStatus = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/shop/products/cloudinary-status`);
    return res?.data || { success: false, configured: false };
  } catch (err) {
    return {
      success: false,
      configured: false,
      message: err?.response?.data?.message || err.message,
    };
  }
};
