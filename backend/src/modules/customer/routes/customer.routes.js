const express = require('express');
const { 
    registerCustomerController,
    getCustomerByPhoneController,
    editCustomerController,
    deleteCustomerController,
    setCustomerStatusController,
      } = require('../controller/customer.controller.');

const router = express.Router();

router.post('/register', registerCustomerController);
router.get('/get', getCustomerByPhoneController);
router.put('/edit', editCustomerController);
router.delete('/delete', deleteCustomerController);
router.put('/status', setCustomerStatusController);

module.exports = router;
