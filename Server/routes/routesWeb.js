const express = require('express');
const services = require('./../services/render');
const webController = require('./../controller/webController');

const router = express.Router();

// home page
router.get('/', services.homepage, services.exit);
router.get('/exit', services.exit);

// mail in payment receipe download
router.get('/Download/:id', webController.TenamentDBPDFDownloadInMail);

// forgot page
router.get("/forgotPage/:UserForgot", services.forgot);

module.exports = router;