const express = require('express');
const services = require('./../services/render');
const userController = require('./../controller/userController');

const router = express.Router();

// ! render
// login and Sign up page
router.get('/signUp', services.UserSignUp);
router.get('/login', services.UserLogin);

// transaction success or fail page
router.get('/cancel', services.cancel);
router.get("/success/:id/:Transcation_ID/:Reference", services.successPage);

// ! API
// Login and Sign up APIs
router.post('/api/signUp', userController.create);
router.post('/api/login', userController.login);

// Forgot Password
router.post('/api/forgot', userController.forgot);
router.get('/forgot/:id', userController.passwordEdit);
router.post('/api/forgotPassword/:id', userController.passwordEditSubmit);

// Bill Board
router.get('/BillDashbord', userController.billboard);

// Edit user Detailes
router.get('/BillDashbord/userProfile', userController.userProfile);
router.get('/BillDashbord/userProfile/userEdit', userController.userEdit);
router.post('/BillDashbord/userProfile/userEdit/userEditSubmit', userController.userEditSubmit);

// Bill page
router.get('/BillDashbord/BillPayment/:tenment', userController.billDetails);

// Payment and mail send 
router.post("/BillDashbord/payment/:id", userController.payment);
router.get("/paymentSuccess/:id/:Transcation_ID/:Reference", userController.success);
router.post("/successMail/:id/:Transcation_ID/:Reference", userController.PaymentMail);

// Download Receipt
router.get('/BillDashbord/Download/:id', userController.downloadReceipe)


// router.post('/AddTenament/:id', userController.addTenment);
// router.get('/AddTenament/:id', userController.Tenment);
module.exports = router;