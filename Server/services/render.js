const axios = require('axios');

// ------------------------------------- User ------------------------------------------
exports.UserSignUp = (req, res) => {
    res.render('sign_Up', { title: "Sign Up", alert: false });
}

exports.homepage = (req, res) => {
    res.render('index', { title: "Home" });
}

exports.UserLogin = (req, res) => {
    res.render('login', { title: "Login", alert: false });
}

// session was destroy
exports.exit = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
        else {
            res.status(200).redirect('/');
        }
    });
}

exports.cancel = (req, res) => {
    res.render('Fail', { title: "Payment Fail", alert: false });
}

exports.successPage = (req, res) => {
    res.status(200).render('success', { title: "Payment Success", TransactionDetails: req.params });
}

// ------------------------------------- Admin ------------------------------------------
exports.AdminSignUp = (req, res) => {
    res.render('Admin_SignUp', { title: "Sign Up", alert: false });
}

exports.AdminLogin = (req, res) => {
    res.render('Admin_Login', { title: "Login", alert: false });
}