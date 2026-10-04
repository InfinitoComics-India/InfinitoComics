import AdminService from "../services/admin-service.js";
import Employee from "../models/Employee.js";

const adminService = new AdminService();

// Create a new admin
const createAdmin = async (req, res) => {
    try {
        const { email, password, role, roles, name, employeeId } = req.body;
        const finalRoles = roles?.length > 0 ? roles : (role ? [role] : []);

        const adminData = await adminService.createAdmin({
            email,
            password,
            role,
            roles: finalRoles,
            name,
            employeeId: employeeId || "",
        });

        // ── Auto-create Employee record if role includes "employee" ──
        if (finalRoles.includes("employee")) {
            try {
                const nameParts = name.trim().split(" ");
                const firstName = nameParts[0] || name;
                const lastName  = nameParts.slice(1).join(" ") || "-";

                // Check if employee record already exists for this email
                const existing = await Employee.findOne({ email: email.toLowerCase() });
                if (!existing) {
                    await Employee.create({
                        employeeId:     employeeId || undefined, // let auto-gen if not set
                        firstName,
                        lastName,
                        email:          email.toLowerCase(),
                        designation:    "Team Member",
                        department:     "Other",
                        employmentType: "full-time",
                        joiningDate:    new Date(),
                        hrRole:         "employee",
                        status:         "active",
                    });
                }
            } catch (empErr) {
                // Don't fail the whole request if employee creation fails
                console.warn("Auto employee record creation warning:", empErr.message);
            }
        }

        return res.status(201).json({
            success: true,
            message: "Successfully created admin",
            data: adminData,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Login an admin
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const adminData = await adminService.loginAdmin(email, password);

        return res.status(200).json({
            success: true,
            message: "Successfully logged in",
            data: adminData,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const allAdmins = await adminService.getAllAdmins();
        return res.status(200).json({
            success: true,
            message: "Successfully fetched all admins",
            data: allAdmins,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAdminById = async (req, res) => {
    try {
        const admin = await adminService.getAdminById(req.params.id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Admin found",
            data: admin,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateAdmin = async (req, res) => {
    try {
        const updatedAdmin = await adminService.updateAdmin(req.params.id, req.body);
        if (!updatedAdmin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Admin updated successfully",
            data: updatedAdmin,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const deletedAdmin = await adminService.deleteAdmin(req.params.id);
        if (!deletedAdmin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Admin deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export default {
    createAdmin,
    loginAdmin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
}