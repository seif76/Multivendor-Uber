const express = require('express');
const { deleteCaptainController, editCaptainController,
        getCaptainByPhoneController,setCaptainStatusController,getActiveCaptainsController,
        getPendingCaptainsController,getDeactivatedCaptainsController,getCaptainProfileController,
        getAllCaptainsController,
        getAllCaptainStatusCountsController,
      } = require('../controllers/captain.controller');
const { authenticate } = require('../../../middlewares/auth.middleware')
const router = express.Router();
const authRoutes = require('../routes/auth.routes')
router.use('/auth', authRoutes);

//router.post('/register', registerCaptainController);
router.put('/edit',authenticate, editCaptainController);


router.get('/active',authenticate, getActiveCaptainsController);

router.get('/deactivated',authenticate, getDeactivatedCaptainsController);
router.get('/profile',authenticate,getCaptainProfileController)




// for Admin Dashboard

router.get('/all', getAllCaptainsController);
router.get('/get-all-captains-status', getAllCaptainStatusCountsController);
router.delete('/delete', deleteCaptainController);
router.get('/pending', getPendingCaptainsController);
router.put('/status', setCaptainStatusController);

router.get('/get-by-phone', getCaptainByPhoneController);






module.exports = router;
