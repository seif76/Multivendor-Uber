const express = require('express');
const { deleteCaptainController, editCaptainController,
        getCaptainByPhoneController,setCaptainStatusController,getActiveCaptainsController,
        getPendingCaptainsController,getDeactivatedCaptainsController,getCaptainProfileController
      } = require('../controllers/captain.controller');
const { authenticate } = require('../../../middlewares/auth.middleware')
const router = express.Router();
const authRoutes = require('../routes/auth.routes')
router.use('/auth', authRoutes);

//router.post('/register', registerCaptainController);
router.delete('/delete',authenticate, deleteCaptainController);
router.put('/edit',authenticate, editCaptainController);
router.get('/get',authenticate, getCaptainByPhoneController);
router.put('/status',authenticate, setCaptainStatusController);
router.get('/active',authenticate, getActiveCaptainsController);
router.get('/pending',authenticate, getPendingCaptainsController);
router.get('/deactivated',authenticate, getDeactivatedCaptainsController);
router.get('/profile',authenticate,getCaptainProfileController)


module.exports = router;
