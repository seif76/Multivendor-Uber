const { User } = require('../../../app/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
//const {registerCaptain} = require('../services/captain.service');



const loginDeliverymanController = async (req, res) => {
    const { phone_number, password } = req.body;
  
    if (!phone_number || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
    }
  
    try {
      const user = await User.findOne({
        where: {
          phone_number,
          deliveryman_status: { [Op.ne]: 'none' }, // must be a deliveryman
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'deliveryman not found' });
      }
  
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Incorrect password' });
      }
  
      // const token = jwt.sign(
      //   { id: user.id, role: 'captain' },
      //   process.env.JWT_SECRET,
      //   { expiresIn: '7d' }
      // );
  
      // You can remove "expiresIn" for a token with no expiration
      const token = jwt.sign(
        {
          id: user.id,
          phone_number: user.phone_number,
          gender: user.gender,
          captain_status: user.captain_status,
          customer_status: user.customer_status,
          deliveryman_status: user.deliveryman_status,
          vendor_status: user.vendor_status,
          user_type: 'deliveryman'
        },
        process.env.JWT_SECRET
        // , { expiresIn: '30d' } // REMOVE THIS LINE for no expiry
      );
  
  
      return res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: `Login failed: ${error.message}` });
    }
  };


  const checkCustomerStatus = async (req, res) => {
    const { phone_number, password } = req.body;
  
    if (!phone_number || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
    }
  
    try {
      const user = await User.findOne({
        where: {
          phone_number,
          customer_status: { [Op.ne]: 'none' }, // must be a customer
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'this account is not a customer' });
      }
      if (user.deliveryman_status !== 'none') {
        return res.status(400).json({ error: 'this account is already a deliveryman' });
      }
  
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Incorrect password' });
      }
  
  
      return res.status(200).json({
        user
      });
    } catch (error) {
      return res.status(500).json({ error: `Login failed: ${error.message}` });
    }
  };

  
module.exports = {
    loginDeliverymanController,
    checkCustomerStatus,
    //registerCaptainController,
  };
  