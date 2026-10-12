import AdminService from "../services/admin-service.js";
const adminService = new AdminService();
// Create a new admin
const createAdmin = async (req, res) => {
    try {
        const { email, password, role, name } = req.body;

        const adminData = await adminService.createAdmin({
            email,
            password,
            role,
            name
        });

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

const getShopAccessStatus = async (req, res) => {
    try {
        const user = req.user;
        const result = await adminService.getShopAccessStatus(user?.email, user);
        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const toggleShopAccess = async (req, res) => {
    try {
        const { email, shopAccess, employeeId } = req.body;
        if (!email && !employeeId) {
            return res.status(400).json({
                success: false,
                message: "Email or employeeId is required",
            });
        }
        const result = await adminService.toggleShopAccess(email, shopAccess, employeeId);
        return res.status(200).json({
            success: true,
            message: `Shop access ${shopAccess ? "granted" : "revoked"} successfully`,
            data: result,
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
    deleteAdmin,
    getShopAccessStatus,
    toggleShopAccess
}