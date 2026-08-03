import express from 'express';
import {
  createApplication,
  getAllApplications,
  deleteApplication,
} from '../controller/researchApplication-controller.js';
import { adminauthenticate } from '../middleware/adminauth.js';

const router = express.Router();

// Public — anyone can submit
router.post('/', createApplication);

// Admin only — view and manage applications
router.get('/', adminauthenticate, getAllApplications);
router.delete('/:id', adminauthenticate, deleteApplication);

export default router;
