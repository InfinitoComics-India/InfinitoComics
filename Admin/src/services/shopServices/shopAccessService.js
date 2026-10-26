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

  // Authoritative check on direct shopAccess boolean property
  if (adminObj?.shopAccess === false) return false;
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
    const empEmail = String(res?.data?.data?.employeeEmail || '').toLowerCase().trim();

    // Update stored Admin object with latest shopAccess
    const adminRaw = localStorage.getItem('Admin');
    let curAdminEmail = '';
    if (adminRaw) {
      try {
        const parsedAdmin = JSON.parse(adminRaw);
        parsedAdmin.shopAccess = access;
        curAdminEmail = String(parsedAdmin.email || '').toLowerCase().trim();
        localStorage.setItem('Admin', JSON.stringify(parsedAdmin));
      } catch {}
    }

    // Update local allowed employee cache
    const current = getShopAllowedEmployees();
    let next;
    const targets = [email, empEmail, curAdminEmail].filter(Boolean);

    // Also match any email containing common username (e.g. arshiya)
    const keywords = targets.map((t) => t.split('@')[0].replace(/[0-9._-]/g, '')).filter((k) => k.length >= 3);

    if (access) {
      next = Array.from(new Set([...current, ...targets]));
    } else {
      next = current.filter((e) => {
        if (targets.includes(e)) return false;
        const ePrefix = e.split('@')[0].replace(/[0-9._-]/g, '');
        if (keywords.some((kw) => ePrefix.includes(kw) || kw.includes(ePrefix))) return false;
        return true;
      });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    notifyAccessChange({ 
      type: 'shop_access_updated', 
      email, 
      employeeEmail: empEmail, 
      shopAccess: access, 
      allowedEmails: next 
    });
    return access;
  } catch (err) {
    console.warn('Live shop access check warning:', err.message);
    const curAdmin = JSON.parse(localStorage.getItem('Admin') || '{}');
    if (curAdmin?.shopAccess === false) return false;
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
  const adminEmail = String(employee.adminEmail || '').toLowerCase().trim();
  const empId = employee._id || employee.id || employee.employeeId;
  const name = employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  const token = localStorage.getItem('authToken');

  // 1. Collect all target identifiers and email variations
  const targets = [email, adminEmail].filter(Boolean);
  const cleanName = String(name || '').toLowerCase().trim();
  const nameParts = cleanName.split(/\s+/).filter((p) => p.length >= 3);
  const emailPrefixes = targets.map((t) => t.split('@')[0].replace(/[0-9._-]/g, '')).filter((p) => p.length >= 3);
  const allKeywords = Array.from(new Set([...nameParts, ...emailPrefixes]));

  // Update local storage list immediately
  const current = getShopAllowedEmployees();
  let next = [];
  if (grant) {
    next = Array.from(new Set([...current, ...targets]));
  } else {
    next = current.filter((e) => {
      if (targets.includes(e)) return false;
      const ePrefix = e.split('@')[0].replace(/[0-9._-]/g, '');
      if (allKeywords.some((kw) => ePrefix.includes(kw) || kw.includes(ePrefix))) return false;
      return true;
    });
  }
  setShopAllowedEmployees(next);

  // 2. Call dedicated backend endpoint to persist across Admin, Employee, and Account collections
  let patchSuccess = false;
  try {
    const res = await axios.patch(
      `${BACKEND_URL}/admin/shop-access/toggle`,
      {
        email,
        adminEmail,
        shopAccess: Boolean(grant),
        employeeId: empId,
        name,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res?.data?.success) patchSuccess = true;
  } catch (err) {
    console.warn('Backend admin shop-access patch toggle warning:', err.message);
  }

  if (!patchSuccess) {
    try {
      await axios.put(
        `${BACKEND_URL}/admin/shop-access/toggle`,
        {
          email,
          adminEmail,
          shopAccess: Boolean(grant),
          employeeId: empId,
          name,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.warn('Backend admin shop-access put fallback warning:', err.message);
    }
  }

  // 3. Also update Employee HR document if empId exists
  if (empId) {
    try {
      await updateEmployee(empId, { shopAccess: Boolean(grant) });
    } catch (e) {
      console.warn('Backend updateEmployee shopAccess warning:', e.message);
    }
  }

  // 4. If current admin in localStorage matches by email, adminEmail, or name, update local Admin object
  const curAdmin = JSON.parse(localStorage.getItem('Admin') || '{}');
  const curAdminEmail = String(curAdmin?.email || '').toLowerCase().trim();
  const curAdminName = String(curAdmin?.name || '').toLowerCase().trim();
  const isMe = (email && curAdminEmail === email) ||
               (adminEmail && curAdminEmail === adminEmail) ||
               (cleanName && curAdminName === cleanName) ||
               (nameParts.some((p) => curAdminName.includes(p) || curAdminEmail.includes(p)));
  if (isMe) {
    curAdmin.shopAccess = Boolean(grant);
    localStorage.setItem('Admin', JSON.stringify(curAdmin));
  }

  notifyAccessChange({ 
    type: 'shop_access_updated', 
    email, 
    adminEmail, 
    name, 
    shopAccess: Boolean(grant), 
    allowedEmails: next 
  });
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
      employeeList = hrData.map((emp, idx) => {
        const em = emp.email ? String(emp.email).toLowerCase().trim() : '';
        let hasAccess = false;
        if (typeof emp.shopAccess === 'boolean') {
          hasAccess = emp.shopAccess;
          if (hasAccess && em) allowedEmails.add(em);
          else if (!hasAccess && em) allowedEmails.delete(em);
        } else {
          hasAccess = em ? allowedEmails.has(em) : false;
        }

        const uniqueId = String(emp._id || emp.id || `hr_${emp.employeeId || idx}`);
        return {
          id: uniqueId,
          _id: emp._id || uniqueId,
          employeeId: emp.employeeId || `EMP-${idx + 1}`,
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee',
          email: em,
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
      admins.forEach((adm, idx) => {
        const em = adm.email ? String(adm.email).toLowerCase().trim() : '';
        const admName = String(adm.name || '').toLowerCase().trim();
        const existingIdx = employeeList.findIndex((e) => {
          if (em && e.email === em) return true;
          if (admName && e.name && e.name.toLowerCase().trim() === admName) return true;
          // Match by first name if first name is >= 3 chars
          if (admName && e.firstName && admName === e.firstName.toLowerCase().trim()) return true;
          if (admName && e.name && (e.name.toLowerCase().includes(admName) || admName.includes(e.name.toLowerCase()))) return true;
          // Match by email username prefix
          const emPrefix = em.split('@')[0].replace(/[0-9._-]/g, '');
          const ePrefix = String(e.email || '').split('@')[0].replace(/[0-9._-]/g, '');
          if (emPrefix.length >= 3 && ePrefix.length >= 3 && (emPrefix === ePrefix || emPrefix.includes(ePrefix) || ePrefix.includes(emPrefix))) {
            return true;
          }
          return false;
        });
        const roles = adm.roles || (adm.role ? [adm.role] : []);
        const isShopAdminOrSuper = roles.includes('superadmin') || roles.includes('shop_admin');

        let hasAccess = false;
        if (isShopAdminOrSuper) {
          hasAccess = true;
          if (em) allowedEmails.add(em);
        } else if (typeof adm.shopAccess === 'boolean') {
          hasAccess = adm.shopAccess;
          if (hasAccess && em) allowedEmails.add(em);
          else if (!hasAccess && em) allowedEmails.delete(em);
        } else {
          hasAccess = em ? allowedEmails.has(em) : false;
        }

        if (existingIdx >= 0) {
          // If superadmin or shop_admin, full access is guaranteed.
          // Otherwise, if either source is explicitly restricted (false), it MUST be restricted.
          const hrAccess = employeeList[existingIdx].shopAccess;
          let finalAccess = false;
          if (isShopAdminOrSuper) {
            finalAccess = true;
          } else if (hrAccess === false || adm.shopAccess === false) {
            finalAccess = false;
          } else {
            finalAccess = hrAccess === true || adm.shopAccess === true;
          }

          employeeList[existingIdx].shopAccess = finalAccess;
          employeeList[existingIdx].roles = roles;
          employeeList[existingIdx].adminId = adm._id || adm.id;
          employeeList[existingIdx].adminEmail = em;
          if (finalAccess) {
            if (em) allowedEmails.add(em);
            if (employeeList[existingIdx].email) allowedEmails.add(employeeList[existingIdx].email);
          } else {
            if (em) allowedEmails.delete(em);
            if (employeeList[existingIdx].email) allowedEmails.delete(employeeList[existingIdx].email);
          }
        } else {
          // Add as distinct employee entry with unique id
          const uniqueId = String(adm._id || adm.id || `adm_${idx}`);
          employeeList.push({
            id: uniqueId,
            _id: adm._id || uniqueId,
            employeeId: 'ADM-' + (adm._id ? String(adm._id).slice(-4) : `${idx + 1}`),
            firstName: adm.name || '',
            lastName: '',
            name: adm.name || (em ? em.split('@')[0] : 'Staff Member'),
            email: em,
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

  // Sync back clean allowed set to localStorage
  const finalAllowed = Array.from(allowedEmails);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalAllowed));
  } catch {}

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
