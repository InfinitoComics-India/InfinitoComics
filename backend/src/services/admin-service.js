import AdminRepository from "../repository/admin-repository.js";
import jwt from "jsonwebtoken";
import config from "../config/server-config.js";
import Employee from "../models/Employee.js";

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
            return {token, newAdmin};
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
            let hasShopAccess = Boolean(admin.shopAccess);
            if (!hasShopAccess && admin.email) {
                try {
                    const emp = await Employee.findOne({ 
                        email: { $regex: new RegExp(`^${admin.email.trim()}$`, "i") } 
                    });
                    if (emp && emp.shopAccess) {
                        hasShopAccess = true;
                    }
                } catch (_) {}
            }

            const roles = admin.roles || (admin.role ? [admin.role] : []);
            if (roles.includes('superadmin') || roles.includes('shop_admin')) {
                hasShopAccess = true;
            }

            const payload = {
                id: admin._id,
                email: admin.email,
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

    async getShopAccessStatus(email, user = null) {
        try {
            const cleanEmail = String(email || user?.email || "").trim().toLowerCase();
            const roles = user?.roles || (user?.role ? [user.role] : []);
            if (roles.includes("superadmin") || roles.includes("shop_admin")) {
                return { success: true, email: cleanEmail, shopAccess: true, isSuper: true };
            }

            let hasAccess = false;
            if (user?.shopAccess === true) {
                hasAccess = true;
            }

            if (!hasAccess && cleanEmail) {
                const [adminDoc, empDoc] = await Promise.all([
                    this.adminRepository.findByEmail(cleanEmail).catch(() => null),
                    Employee.findOne({ email: { $regex: new RegExp(`^${cleanEmail}$`, "i") } }).catch(() => null)
                ]);

                if (adminDoc?.shopAccess === true || empDoc?.shopAccess === true) {
                    hasAccess = true;
                }
            }

            return { success: true, email: cleanEmail, shopAccess: hasAccess };
        } catch (error) {
            throw new Error(`Error checking shop access: ${error.message}`);
        }
    }

    async toggleShopAccess(email, shopAccess, employeeId = null) {
        try {
            const cleanEmail = String(email || "").trim().toLowerCase();
            const accessBool = Boolean(shopAccess);

            const promises = [];

            if (cleanEmail) {
                // Update Admin collection for this email
                promises.push(
                    import("../models/Admin.js").then(({ default: AdminModel }) => 
                        AdminModel.updateMany(
                            { email: { $regex: new RegExp(`^${cleanEmail}$`, "i") } },
                            { $set: { shopAccess: accessBool } }
                        )
                    ).catch(() => null)
                );

                // Update Employee collection for this email
                promises.push(
                    Employee.updateMany(
                        { email: { $regex: new RegExp(`^${cleanEmail}$`, "i") } },
                        { $set: { shopAccess: accessBool } }
                    ).catch(() => null)
                );
            }

            if (employeeId) {
                promises.push(
                    Employee.findByIdAndUpdate(
                        employeeId,
                        { $set: { shopAccess: accessBool } },
                        { new: true }
                    ).catch(() => null)
                );
            }

            await Promise.all(promises);

            return { success: true, email: cleanEmail, shopAccess: accessBool };
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
            const admin =  await this.adminRepository.getById(id);
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