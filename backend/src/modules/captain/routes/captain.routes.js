const express = require('express');
const { registerCaptainController,deleteCaptainController, editCaptainController,
        getCaptainByPhoneController,setCaptainStatusController,getActiveCaptainsController,
        getPendingCaptainsController,getDeactivatedCaptainsController,
      } = require('../controllers/captain.controller');

const router = express.Router();

router.post('/register', registerCaptainController);
router.delete('/delete', deleteCaptainController);
router.put('/edit', editCaptainController);
router.get('/get', getCaptainByPhoneController);
router.put('/status', setCaptainStatusController);
router.get('/active', getActiveCaptainsController);
router.get('/pending', getPendingCaptainsController);
router.get('/deactivated', getDeactivatedCaptainsController);


module.exports = router;
