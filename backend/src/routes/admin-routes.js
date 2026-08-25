import express from 'express';
import AdminController from '../controller/admin-controller.js';
import { checkRole } from '../middleware/roleCheck.js';
import { adminauthenticate } from '../middleware/adminauth.js';

const router = express.Router();

// Public route — login only
router.post('/login', AdminController.loginAdmin);

// Superadmin only — create, list, update, delete admins
router.post('/create', adminauthenticate, checkRole(['superadmin']), AdminController.createAdmin);
router.get('/all', adminauthenticate, checkRole(['superadmin']), AdminController.getAllAdmins);
router.get('/:id', adminauthenticate, checkRole(['superadmin']), AdminController.getAdminById);
router.put('/:id', adminauthenticate, checkRole(['superadmin']), AdminController.updateAdmin);
router.delete('/:id', adminauthenticate, checkRole(['superadmin']), AdminController.deleteAdmin);

export default router;