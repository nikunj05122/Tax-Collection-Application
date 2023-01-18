const express = require('express');
const services = require('./../services/render');
const userController = require('./../controller/userController');

const router = express.Router();

router.get('/signUp', services.UserSignUp);
router.get('/login', services.UserLogin);
router.get('/', services.homepage, services.exit);
router.get('/exit', services.exit);
// API
router.post('/api/signUp', userController.create);
router.post('/api/login', userController.login);
router.get('/BillDashbord', userController.billboard);
router.get('/BillDashbord/userProfile', userController.userProfile);
router.get('/BillDashbord/userProfile/userEdit', userController.userEdit);
router.post('/BillDashbord/userProfile/userEdit/userEditSubmit', userController.userEditSubmit);
router.get('/BillDashbord/BillPayment/:tenment', userController.billDetails);
// router.post('/AddTenament/:id', userController.addTenment);
// router.get('/AddTenament/:id', userController.Tenment);
router.get('/BillDashbord/Download/:id', userController.downloadReceipe)

module.exports = router;