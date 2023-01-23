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
router.get('/dashBoard/adminProfile', adminController.adminProfile);
router.get('/dashBoard/adminProfile/adminProfileEdit', adminController.adminProfileEdit);
router.post('/dashBoard/adminProfile/adminProfileEdit/adminProfileEditSubmit', adminController.adminProfileEditSubmit);
router.get('/dashBoard/userDetails', adminController.userDetails);
router.get('/dashBoard/userDetailsEdit/:id', adminController.userDetailsEdit);
router.post('/dashBoard/userDetailsAdd/:id', adminController.userDetailsAdd);
router.post('/dashBoard/userDetailsRemove/:id', adminController.userDetailsRemove);
router.post('/api/dashBoard', adminController.search);
router.post('/api/dashBoard/searchUser', adminController.searchUser);
router.get('/dashBoard/details/:tenment', adminController.details);
// router.post('/api/tenmentAndPayment', adminController.tenmentAndPaymentEntry);
// router.post('/api/addPayment', adminController.addPayment);

module.exports = router;