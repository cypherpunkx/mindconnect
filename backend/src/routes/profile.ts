import { Router } from 'express';
import { ProfileController, profilePictureUpload } from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All profile routes require authentication
router.use(authenticateToken);

// Profile management routes
router.put('/update', ProfileController.updateProfile);
router.put('/password', ProfileController.updatePassword);

// Profile picture routes
router.post('/picture', profilePictureUpload.single('profilePicture'), ProfileController.uploadProfilePicture);
router.delete('/picture', ProfileController.deleteProfilePicture);

export default router;