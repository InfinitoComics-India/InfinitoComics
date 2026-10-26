import AdminRepository from "../repository/admin-repository.js";
import jwt from "jsonwebtoken";
import config from "../config/server-config.js";
import Employee from "../models/Employee.js";
import Admin from "../models/Admin.js";
import Account from "../models/User.js";
import mongoose from "mongoose";

class AdminService {
    constructor() {
        this.adminRepository = new AdminRepository();
    }

    async createAdmin(adminData) {
        try {
            const existingAdmin = await this.adminRepository.findByEmail(adminData.email);
            if (existingAdmin) {
                throw new Error('Admin with this email already exists');
            }
            const newAdmin = await this.adminRepository.create(adminData);
            const payload = {
                id: newAdmin._id,
                email: newAdmin.email,
                role: newAdmin.role,
                roles: newAdmin.roles || (newAdmin.role ? [newAdmin.role] : []),
            };
            const token = jwt.sign(payload, config.JWT_SECRET_KEY, {
                expiresIn: config.JWT_EXPIRY_DATE
            });
            return { token, newAdmin };
        } catch (error) {
            throw new Error(`Error creating admin: ${error.message}`);
        }
    }

    async loginAdmin(email, password) {
        try {
            const admin = await this.adminRepository.findByEmail(email);
            if (!admin) {
                throw new Error('Admin not found');
            }
            const isPasswordValid = await admin.comparePassword(password);
            if (!isPasswordValid) {
                throw new Error('Invalid password');
            }

            // Check shopAccess on Admin or linked Employee record
            const roles = admin.roles || (admin.role ? [admin.role] : []);
            let hasShopAccess = false;

            if (roles.includes('superadmin') || roles.includes('shop_admin')) {
                hasShopAccess = true;
            } else {
                // For other roles (especially employee), check linked employee record first
                const emp = await this._findLinkedEmployee(admin.email, admin.name);
                if (emp) {
                    hasShopAccess = Boolean(emp.shopAccess);
                } else {
                    hasShopAccess = Boolean(admin.shopAccess);
                }

                // Keep Admin document shopAccess field synchronized
                if (admin.shopAccess !== hasShopAccess) {
                    await Admin.findByIdAndUpdate(admin._id, { shopAccess: hasShopAccess }).catch(() => { });
                    admin.shopAccess = hasShopAccess;
                }
            }

            const payload = {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                roles: roles,
                shopAccess: hasShopAccess,
            };
            const token = jwt.sign(payload, config.JWT_SECRET_KEY, {
                expiresIn: config.JWT_EXPIRY_DATE
            });

            const adminObj = admin.toObject ? admin.toObject() : { ...admin };
            adminObj.shopAccess = hasShopAccess;

            return { token, admin: adminObj };
        } catch (error) {
            throw new Error(`Error logging in admin: ${error.message}`);
        }
    }

    async _findLinkedEmployee(email, name = null) {
        try {
            const orConditions = [];
            if (email) {
                const cleanEmail = String(email).trim().toLowerCase();
                const escapedEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                orConditions.push({ email: { $regex: new RegExp(`^${escapedEmail}$`, "i") } });

                // Also match email username part (e.g., 'arshiya' from 'arshiya@infinitohq.com')
                const emailPrefix = cleanEmail.split('@')[0].replace(/[0-9._-]/g, '');
                if (emailPrefix.length >= 3) {
                    orConditions.push({ email: { $regex: new RegExp(emailPrefix, "i") } });
                    orConditions.push({ firstName: { $regex: new RegExp(`^${emailPrefix}$`, "i") } });
                }
            }

            if (name) {
                const cleanName = String(name).trim();
                const parts = cleanName.split(/\s+/).filter(Boolean);
                if (parts.length >= 2) {
                    const firstEsc = parts[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const lastEsc = parts.slice(1).join(" ").replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    orConditions.push({
                        firstName: { $regex: new RegExp(`^${firstEsc}$`, "i") },
                        lastName: { $regex: new RegExp(`^${lastEsc}$`, "i") }
                    });
                } else if (parts.length === 1 && parts[0].length >= 3) {
                    const esc = parts[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    orConditions.push({ firstName: { $regex: new RegExp(`^${esc}$`, "i") } });
                    orConditions.push({ lastName: { $regex: new RegExp(`^${esc}$`, "i") } });
                }

                orConditions.push({
                    $expr: {
                        $eq: [
                            { $toLower: { $concat: ["$firstName", " ", "$lastName"] } },
                            cleanName.toLowerCase()
                        ]
                    }
                });
            }

            if (orConditions.length === 0) return null;
            return await Employee.findOne({ $or: orConditions });
        } catch (_) {
            return null;
        }
    }

    async getShopAccessStatus(email, user = null) {
        try {
            const cleanEmail = String(email || user?.email || "").trim().toLowerCase();
            const roles = user?.roles || (user?.role ? [user.role] : []);

            // Superadmin and shop_admin have full unconditional bypass
            if (roles.includes("superadmin") || roles.includes("shop_admin")) {
                return { success: true, email: cleanEmail, shopAccess: true, isSuper: true };
            }

            // Fetch live Admin / Account record from DB
            let adminDoc = null;
            if (user?.id && mongoose.Types.ObjectId.isValid(user.id)) {
                adminDoc = await Admin.findById(user.id).catch(() => null);
                if (!adminDoc) {
                    adminDoc = await Account.findById(user.id).catch(() => null);
                }
            }
            if (!adminDoc && cleanEmail) {
                adminDoc = await this.adminRepository.findByEmail(cleanEmail).catch(() => null);
                if (!adminDoc) {
                    adminDoc = await Account.findOne({ email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }).catch(() => null);
                }
            }

            const userName = user?.name || adminDoc?.name || "";
            const empDoc = await this._findLinkedEmployee(cleanEmail, userName);

            let hasAccess = false;
            // Strict rule: If an employee record exists, its shopAccess must be explicitly true
            if (empDoc) {
                hasAccess = empDoc.shopAccess === true;
                // Synchronize admin / account doc so it stays in sync
                if (adminDoc && adminDoc.shopAccess !== hasAccess) {
                    await Admin.findByIdAndUpdate(adminDoc._id, { shopAccess: hasAccess }).catch(() => { });
                    await Account.findByIdAndUpdate(adminDoc._id, { shopAccess: hasAccess }).catch(() => { });
                }
            } else if (adminDoc) {
                // Must be explicitly boolean true, otherwise restricted (false)
                hasAccess = adminDoc.shopAccess === true;
            }

            return {
                success: true,
                email: cleanEmail,
                employeeEmail: empDoc?.email || cleanEmail,
                shopAccess: hasAccess
            };
        } catch (error) {
            throw new Error(`Error checking shop access: ${error.message}`);
        }
    }

    async toggleShopAccess(email, shopAccess, employeeId = null, name = null) {
        try {
            const cleanEmail = String(email || "").trim().toLowerCase();
            const accessBool = Boolean(shopAccess);
            const cleanName = String(name || "").trim();

            const empOrQueries = [];
            const adminOrQueries = [];

            if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
                empOrQueries.push({ _id: employeeId });
                adminOrQueries.push({ _id: employeeId });
            } else if (employeeId) {
                empOrQueries.push({ employeeId: String(employeeId).trim() });
            }

            if (cleanEmail) {
                const escapedEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const emailRegex = { $regex: new RegExp(`^${escapedEmail}$`, "i") };
                empOrQueries.push({ email: emailRegex });
                adminOrQueries.push({ email: emailRegex });

                // Also query email prefix keyword if >= 3 characters (e.g. 'arshiya')
                const prefix = cleanEmail.split('@')[0].replace(/[0-9._-]/g, '');
                if (prefix.length >= 3) {
                    const prefRegex = { $regex: new RegExp(prefix, "i") };
                    empOrQueries.push({ email: prefRegex });
                    empOrQueries.push({ firstName: prefRegex });
                    adminOrQueries.push({ email: prefRegex });
                    adminOrQueries.push({ name: prefRegex });
                }
            }

            if (cleanName) {
                const escapedName = cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                adminOrQueries.push({ name: { $regex: new RegExp(`^${escapedName}$`, "i") } });

                const parts = cleanName.split(/\s+/).filter(Boolean);
                if (parts.length >= 2) {
                    const firstEsc = parts[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const lastEsc = parts.slice(1).join(" ").replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    empOrQueries.push({
                        firstName: { $regex: new RegExp(`^${firstEsc}$`, "i") },
                        lastName: { $regex: new RegExp(`^${lastEsc}$`, "i") }
                    });
                    // Also partial match first name on admin/account
                    adminOrQueries.push({ name: { $regex: new RegExp(`^${firstEsc}$`, "i") } });
                } else if (parts.length === 1 && parts[0].length >= 3) {
                    const esc = parts[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    empOrQueries.push({ firstName: { $regex: new RegExp(`^${esc}$`, "i") } });
                    adminOrQueries.push({ name: { $regex: new RegExp(`^${esc}$`, "i") } });
                }

                empOrQueries.push({
                    $expr: {
                        $eq: [
                            { $toLower: { $concat: ["$firstName", " ", "$lastName"] } },
                            cleanName.toLowerCase()
                        ]
                    }
                });
            }

            // Find existing employee first to get any linked info
            let matchedEmp = null;
            if (empOrQueries.length > 0) {
                matchedEmp = await Employee.findOne({ $or: empOrQueries }).catch(() => null);
            }

            if (matchedEmp) {
                const empFullName = `${matchedEmp.firstName || ''} ${matchedEmp.lastName || ''}`.trim();
                if (empFullName) {
                    const escapedEmpName = empFullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    adminOrQueries.push({ name: { $regex: new RegExp(`^${escapedEmpName}$`, "i") } });
                }
                if (matchedEmp.firstName) {
                    const escapedFirst = matchedEmp.firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    adminOrQueries.push({ name: { $regex: new RegExp(`^${escapedFirst}$`, "i") } });
                }
                if (matchedEmp.email) {
                    const escapedEmpEmail = String(matchedEmp.email).trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    adminOrQueries.push({ email: { $regex: new RegExp(`^${escapedEmpEmail}$`, "i") } });
                }
            }

            const promises = [];

            if (empOrQueries.length > 0) {
                promises.push(
                    Employee.updateMany(
                        { $or: empOrQueries },
                        { $set: { shopAccess: accessBool } }
                    ).catch((err) => console.error("Employee toggleShopAccess error:", err.message))
                );
            }

            if (adminOrQueries.length > 0) {
                promises.push(
                    Admin.updateMany(
                        { $or: adminOrQueries },
                        { $set: { shopAccess: accessBool } }
                    ).catch((err) => console.error("Admin toggleShopAccess error:", err.message))
                );
                promises.push(
                    Account.updateMany(
                        { $or: adminOrQueries },
                        { $set: { shopAccess: accessBool } }
                    ).catch((err) => console.error("Account toggleShopAccess error:", err.message))
                );
            }

            await Promise.all(promises);

            return {
                success: true,
                email: cleanEmail,
                name: cleanName || (matchedEmp ? `${matchedEmp.firstName} ${matchedEmp.lastName}` : null),
                shopAccess: accessBool
            };
        } catch (error) {
            throw new Error(`Error toggling shop access: ${error.message}`);
        }
    }

    async getAllAdmins() {
        try {
            return await this.adminRepository.getAll();
        } catch (error) {
            throw new Error(`Error fetching all admins: ${error.message}`);
        }
    }

    async getAdminById(id) {
        try {
            const admin = await this.adminRepository.getById(id);
            if (!admin) {
                throw new Error('Admin not found');
            }
            return admin;
        } catch (error) {
            throw new Error(`Error fetching admin by ID: ${error.message}`);
        }
    }

    async updateAdmin(id, data) {
        try {
            const updatedAdmin = await this.adminRepository.findByIdandUpdate(id, data);
            if (!updatedAdmin) {
                throw new Error('Admin not found');
            }
            return updatedAdmin;
        } catch (error) {
            throw new Error(`Error updating admin: ${error.message}`);
        }
    }

    async deleteAdmin(id) {
        try {
            const deletedAdmin = await this.adminRepository.findByIdandDelete(id);
            if (!deletedAdmin) {
                throw new Error('Admin not found');
            }
            return deletedAdmin;
        } catch (error) {
            throw new Error(`Error deleting admin: ${error.message}`);
        }
    }

}

export default AdminService;