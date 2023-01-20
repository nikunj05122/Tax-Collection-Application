const express = require('express');
const services = require('./../services/render');
const adminController = require('./../controller/adminController');

const router = express.Router();

router.get('/SignUp', services.AdminSignUp);
router.get('/Login', services.AdminLogin);

// API
router.post('/api/SignUp', adminController.create);
router.post('/api/Login', adminController.login);
router.get('/dashBoard', adminController.dashBoard);
router.get('/dashBoard/details/:tenment', adminController.details);
// router.post('/api/tenmentAndPayment', adminController.tenmentAndPaymentEntry);
// router.post('/api/addPayment', adminController.addPayment);

module.exports = router;