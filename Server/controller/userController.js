var randomstring = require("randomstring");
var { UserDB, TenamentDB, paymentDB } = require('./../model/model');
const fs = require('fs');
const pdf = require('pdf-creator-node');
const path = require('path');
// const axios = require('axios');
const options = require('./../../assets/js/options');
const stripe = require("stripe")("sk_test_51MRd1TSHnaTCqUYF365M2jUcfDbWZYEqU9QpdcviZQ67TfbRU8r3mLzizII4TGuHBI3SIcbCsI1K5BRN5EMU8JFn00918BRU15");
// const session = require('express-session');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

// const LOCAL_URL = 'http://localhost:4000';
const LOCAL_URL = 'https://tax-collection.onrender.com';

const EMAIL = '303.nikeg@gmail.com';
const PASS = 'spkjjbaamiermgeu';

exports.create = async (req, res) => {
    // validate request
    if (JSON.stringify(req.body) === '{}') {
        res.status(400).render('sign_Up', { title: "Sign Up", alert: false });
        return;
    }

    const ConfirmPassword = req.body.ConfirmPassword;
    const Password = req.body.password;

    if (ConfirmPassword === Password) {

        try {
            const user = await UserDB.create(req.body);
            res.status(200).redirect('/user/login');
        }
        catch (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating a create operation."
            });
        }
    }
    else {
        res.status(500).render('sign_Up', { title: "Sign Up", user: req.body, alert: true });
    }
}


exports.login = async (req, res) => {

    const data = await UserDB.find({ $and: [{ email: req.body.email }, { password: req.body.password }] });
    if (data.length == 0) {
        res.status(500).render('login', { title: "Login", alert: true });
    } else {
        req.session.user = data;
        res.status(200).redirect(`/user/BillDashbord`);
    }
}

exports.billboard = async (req, res) => {
    try {
        if (req.session.user) {
            const Tenmentdata = [];
            const Paymentdata = [];
            const year = new Date().getFullYear();

            let userData = await UserDB.findById(req.session.user[0]._id);
            let sortedTenment = userData.tenment.sort();
            userData.tenment = sortedTenment;


            let Total = 0;
            for (var i = 0; i < userData.tenment.length; i++) {
                let Tenament = await TenamentDB.find({ tenament: userData.tenment[i] });
                if (Tenament[0].Status == false)
                    Total += Tenament[0].Total;
                Tenmentdata.push(Tenament);
                Paymentdata.push(await paymentDB.find({ $and: [{ tenament: userData.tenment[i] }, { paymentYear: year }] }));
            }

            res.status(200).render('bills', { title: "Bill Dashboard", User: userData, Tenment: Tenmentdata, Payment: Paymentdata, year: year, TotalPay: Total });
        }
        else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Fail to Find details',
        });
    }
}

exports.billDetails = async (req, res) => {
    try {
        if (req.session.user) {
            // console.log(req.params);
            const data = await TenamentDB.find({ tenament: req.params.tenment });
            res.status(200).render('taxPage', { title: "Tex Page", User: (req.session.user)[0], Tenment: data });
        } else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }
    } catch (err) {
        res.status(404).json({
            status: 'fail'
        });
    }
}

exports.payment = async (req, res) => {
    try {
        if (req.session.user) {
            const Transcation_ID = randomstring.generate({ length: 18, readable: true, charset: 'numeric' });
            const Reference = randomstring.generate({ length: 10, readable: true, charset: 'alphanumeric', capitalization: 'uppercase' });
            // const Reference = parseInt(cryptoRandomString({ length: 10, type: 'distinguishable' }));
            const { product } = req.body;
            // console.log(Transcation_ID, Reference)
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "inr",
                            product_data: {
                                name: `Owner: ${req.session.user[0].name}`,
                                description: `Address: ${product.name}
                                              Tenament: ${product.description}
                                              Transcation ID: ${Transcation_ID}
                                              Reference: ${Reference}`
                            },
                            unit_amount: product.amount * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: `${LOCAL_URL}/user/paymentSuccess/${req.params.id}/${Transcation_ID}/${Reference}`,
                cancel_url: `${LOCAL_URL}/user/cancel`,
            });
            res.status(200).json({ id: session.id });
        }
        else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }
    } catch (err) {
        res.status(500).json({
            status: "Fail to payment",
            message: err
        });
    }
}

exports.PaymentMail = async (req, res) => {

    try {
        if (req.session.user) {
            const tenmentData = await TenamentDB.findById(req.params.id);
            // console.log(tenmentData);
            let config = {
                service: 'gmail',
                auth: {
                    user: EMAIL,
                    pass: PASS
                }
            }

            let transporter = nodemailer.createTransport(config);
            // console.log("transporter : ", transporter);
            let MailGenerator = new Mailgen({
                theme: "default",
                product: {
                    name: "Tax Payment",
                    link: `${LOCAL_URL}`,
                    // logo: '/img/DDO.jpg'
                    copyright: 'Copyright © 2019. All rights reserved.'
                }
            })
            // console.log("mailgenerator : ", MailGenerator);

            let response = {
                body: {
                    name: `Your bill payed ${tenmentData.tenament}`,
                    intro: "Your bill has arrived!",
                    table: [
                        {
                            title: "Property Detailes",
                            data: [
                                {
                                    item: "Tenament",
                                    description: `${tenmentData.tenament}`,
                                },
                                {
                                    item: "Taluka",
                                    description: `${tenmentData.Taluka}`,
                                },
                                {
                                    item: "Name",
                                    description: `${tenmentData.Name}`,
                                },
                                {
                                    item: "Postal Address",
                                    description: `${tenmentData.Postal_address}`,
                                },
                                {
                                    item: "Local Address",
                                    description: `${tenmentData.Local_address}`,
                                },
                                {
                                    item: "Usage",
                                    description: `${tenmentData.Usage}`,
                                },
                                {
                                    item: "Occupier",
                                    description: `${tenmentData.Occupier}`,
                                }
                            ]
                        },
                        {
                            title: "Tax Details",
                            data: [
                                {
                                    item: "Property Tax",
                                    price: `${tenmentData.Property_tax}`,
                                },
                                {
                                    item: "Water Tax",
                                    price: `${tenmentData.Water_tax}`,
                                },
                                {
                                    item: "Drainage Tax",
                                    price: `${tenmentData.Drainage_tax}`,
                                },
                                {
                                    item: "SW Tax",
                                    price: `${tenmentData.SW_tax}`,
                                },
                                {
                                    item: "Street Light Tax",
                                    price: `${tenmentData.Street_Light}`,
                                },
                                {
                                    item: "Fire Charge",
                                    price: `${tenmentData.Fire_Charge}`,
                                },
                                {
                                    item: "Env Improve Charge",
                                    price: `${tenmentData.Env_improve_charge}`,
                                },
                                {
                                    item: "Rebate",
                                    price: `${tenmentData.Rebate}`,
                                },
                                {
                                    item: "Education Cess",
                                    price: `${tenmentData.Education_Cess}`,
                                },
                                {
                                    item: "Total",
                                    price: `${tenmentData.Total}`,
                                }
                            ]
                        },
                        {
                            title: "Payment Details",
                            data: [
                                {
                                    item: "Transcation ID",
                                    description: `${req.params.Transcation_ID}`,
                                },
                                {
                                    item: "Reference",
                                    description: `${req.params.Reference}`,
                                }
                            ]
                        }
                    ],
                    action: {
                        instructions: 'To Download the Payment Receipe, please click here:',
                        button: {
                            color: '#48cfad', // Optional action button color
                            text: `Download Receipe`,
                            link: `${LOCAL_URL}/Download/${req.params.id}`
                            // link: '#'
                        }
                    },
                    outro: "Thank you for payment"
                }
            }
            // console.log("response : ", response);

            let mail = MailGenerator.generate(response);
            // console.log("Mail : ", mail);

            let message = {
                from: EMAIL,
                to: req.session.user[0].email,
                // to: 'nikunjgajera104@gmail.com',
                subject: "Your tax payment is successfully pay.",
                html: mail
            }

            await transporter.sendMail(message);

            res.status(200).redirect(`/user/success/${req.params.id}/${req.params.Transcation_ID}/${req.params.Reference}`);
        }
        else {
            res.status(501).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }
    } catch (err) {
        res.status(500).json({
            status: "Fail to send mail",
            message: err
        });
    }
}

exports.success = async (req, res) => {
    try {
        if (req.session.user) {
            // console.log(req.params, req.params.Transcation_ID * 1);
            const TanmentData = await TenamentDB.findById(req.params.id);
            // console.log(req.session.user[0]);

            const paymentData = {
                tenament: TanmentData.tenament,
                Status: true,
                Total: TanmentData.Total,
                paymentYear: `${new Date().getFullYear()}`,
                Date: `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}  ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
                Transcation_ID: req.params.Transcation_ID,
                Reference: req.params.Reference
            }
            const payment = await paymentDB.create(paymentData);
            // console.log(payment);

            const updateData = {
                Status: true
            }
            const ten = await TenamentDB.findByIdAndUpdate(req.params.id, updateData, {
                new: true,
                runValidators: true
            });
            // console.log(ten);


            // ! PDF generater
            // const html = fs.readFile(path.join(__dirname, './../../views/template.html'), 'utf-8', (err, data) => {
            //     if (err) {
            //         console.log(err);
            //         return;
            //     }
            //     console.log(data);
            //     return data;
            // });
            // res.status(200).json({
            //     Data: html
            // });

            const html = fs.readFileSync(path.join(__dirname, './../../views/template.html'), 'utf-8');

            const filename = TanmentData.tenament + '_Payment' + '.pdf';

            var year = new Date().getFullYear();
            var document = {
                html: html,
                data: {
                    tenament: TanmentData.tenament,
                    Total: TanmentData.Total,
                    Name: TanmentData.Name,
                    Postal_address: TanmentData.Postal_address,
                    Local_address: TanmentData.Local_address,
                    Usage: TanmentData.Usage,
                    Occupier: TanmentData.Occupier,
                    Last_Bill_Issue_Date: `1/10/${year}`,
                    Last_Bill_Due_Date: `31/12/${year}`,
                    Property_tax: TanmentData.Property_tax,
                    Water_tax: TanmentData.Water_tax,
                    Drainage_tax: TanmentData.Drainage_tax,
                    SW_tax: TanmentData.SW_tax,
                    Street_Light: TanmentData.Street_Light,
                    Fire_Charge: TanmentData.Fire_Charge,
                    Env_improve_charge: TanmentData.Env_improve_charge,
                    Rebate: TanmentData.Rebate,
                    Education_Cess: TanmentData.Education_Cess,
                    Total: TanmentData.Total,
                    Date: paymentData.Date,
                    Transcation_ID: paymentData.Transcation_ID,
                    Reference: paymentData.Reference
                },
                path: './Download/' + filename,
                type: ""
            };

            res.render('mail', { title: "Payment Success", TransactionDetails: req.params });

            const PDF = await pdf.create(document, options);
            // console.log(PDF);

        }
        else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }
    } catch (err) {
        res.status(504).json({
            status: "Fail to payment",
            message: err
        });
    }
}

exports.downloadReceipe = async (req, res) => {
    try {
        var year = new Date().getFullYear();
        var Tenment = await TenamentDB.find({ tenament: req.params.id });
        var Payment = await paymentDB.find({ $and: [{ tenament: req.params.id }, { paymentYear: year }] });


        res.status(200).render('template.ejs', { title: "Bill Recipe", User: (req.session.user)[0], Tenment: Tenment[0], Payment: Payment[0], year: year, withLogin: true });
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}


exports.userProfile = async (req, res) => {
    // console.log(req.session.user);
    try {
        if (req.session.user) {
            const id = req.session.user[0]._id;

            var data = await UserDB.findById(id);
            // console.log(data);
            res.status(200).render('userPage', { title: "User Details", User: data });
        } else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Fail to get details',
        });
    }
}

exports.userEdit = async (req, res) => {
    try {
        if (req.session.user) {
            const id = req.session.user[0]._id;

            const data = await UserDB.findById(id);
            res.status(200).render('userEditPage', { title: "User Details Edit", User: data });
        } else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Fail to get details',
        });
    }
}

exports.userEditSubmit = async (req, res) => {
    try {
        if (req.session.user) {
            const id = (req.session.user)[0]._id;
            const data = {
                name: req.body.name,
                email: req.body.email,
                number: req.body.number,
                code: req.body.code,
                password: req.body.password
            }

            // console.log(id, data);
            const update = await UserDB.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true
            });

            // console.log(update);

            res.status(200).redirect(`/user/BillDashbord/userProfile`);
        }
        else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }
    } catch (err) {
        // console.log(err);
        res.status(404).json({
            status: 'fail',
            message: 'Fail to update details',
        });
    }
}

exports.forgot = async (req, res) => {
    try {
        // console.log(req.body);
        const userData = await UserDB.find(req.body);

        if (userData.length) {
            let config = {
                service: 'gmail',
                auth: {
                    user: EMAIL,
                    pass: PASS
                }
            }

            let transporter = nodemailer.createTransport(config);
            // console.log("transporter : ", transporter);
            let MailGenerator = new Mailgen({
                theme: "default",
                product: {
                    name: "Tax Payment",
                    link: `${LOCAL_URL}`,
                    // logo: '/img/DDO.jpg'
                    copyright: 'Copyright © 2019. All rights reserved.'
                }
            });

            var response = {
                body: {
                    name: `${userData[0].name}`,
                    intro: 'You have received this email because a password reset request for your account was received.',
                    action: {
                        instructions: 'Click the button below to reset your password:',
                        button: {
                            color: '#ed3266', // Optional action button color
                            text: 'Reset your password',
                            link: `${LOCAL_URL}/user/forgot/${userData[0]._id.valueOf()}`
                        }
                    },
                    outro: 'If you did not request a password reset, no further action is required on your part.'
                }
            };

            let mail = MailGenerator.generate(response);
            // console.log("Mail : ", mail);

            let message = {
                from: EMAIL,
                to: userData[0].email,
                // to: 'nikunjgajera104@gmail.com',
                subject: "Forgot your password.",
                html: mail
            }

            await transporter.sendMail(message);
            // console.log(userData[0]._id.valueOf());
            res.status(200).render('forgot', { title: 'Forgot Page', UserForgot: true, send: true, alert: false });
        } else {
            res.status(200).render('forgot', { title: 'Forgot Page', UserForgot: true, send: false, alert: true });
        }

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Fail to send mail for forgot password user',
        });
    }
}

exports.passwordEdit = async (req, res) => {
    try {
        const id = req.params.id;
        res.status(200).render('passwordPage', { title: "User Details Edit", id: id, UserForgot: true, alert: false });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Fail to get details',
        });
    }
}

exports.passwordEditSubmit = async (req, res) => {
    try {
        const id = req.params.id;
        if (req.body.password === req.body.ConfirmPassword) {
            const data = {
                password: req.body.password
            }

            const update = await UserDB.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true
            });

            // setTimeout(() => {

            // }, 10000);
            res.status(200).redirect(`/user/login`);
        } else {
            const UserForgot = req.params.UserForgot * 1;
            res.status(200).render('passwordPage', { title: "User Details Edit", id: id, UserForgot: true, alert: true });
        }

    } catch (err) {
        // console.log(err);
        res.status(404).json({
            status: 'fail',
            message: 'Fail to update details',
        });
    }
}


// exports.addTenment = async (req, res) => {
//     try {
//         const tenment = (req.session.user)[0].tenment;
//         tenment.push(req.body.Tenment);
//         const id = req.params.id;
//         const data = {
//             tenment: tenment
//         }
//         const updateData = await UserDB.findByIdAndUpdate(id, data, {
//             new: true,
//             runValidators: true
//         });

//         res.status(200).redirect(`/user/AddTenament/${id}`);
//     }
//     catch (err) {
//         res.status(404).json({
//             status: 'fail',
//             message: "fail update"
//         });
//     }
// }

// exports.Tenment = async (req, res) => {
//     try {
//         const Tenmentdata = [];
//         if (req.session.user) {
//             for (var i = 0; i < (req.session.user)[0].tenment.length; i++) {
//                 Tenmentdata.push(await TenamentDB.find({ tenament: (req.session.user)[0].tenment[i] }));
//             }
//             res.status(200).render('--addTenment', { title: "Add Tenment Dashboard", User: (req.session.user)[0], Tenment: Tenmentdata });
//         }
//         else {
//             res.status(500).json({
//                 status: "Fail",
//                 message: "Please Re-Login..."
//             });
//         }
//     } catch (err) {
//         res.status(404).json({
//             status: 'fail'
//         });
//     }
// }