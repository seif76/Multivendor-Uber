const express = require('express');
const { 
    registerCustomerController,
    getCustomerByPhoneController,
    editCustomerController,
    deleteCustomerController,
    setCustomerStatusController,
    getAllCustomersController,
    getAllCustomersStatusCountsController,
    
      } = require('../controller/customer.controller');

const router = express.Router();

router.post('/register', registerCustomerController);
router.get('/get', getCustomerByPhoneController);
router.put('/edit', editCustomerController);
router.put('/status', setCustomerStatusController);


// For Admin web dashboard
router.get('/all', getAllCustomersController);
router.delete('/delete', deleteCustomerController);
router.get('/get-all-customers-status', getAllCustomersStatusCountsController);



module.exports = router;
