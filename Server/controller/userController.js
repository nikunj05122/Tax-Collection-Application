var { UserDB, TenamentDB, paymentDB } = require('./../model/model');
const fs = require('fs');
const pdf = require('pdf-creator-node');
const path = require('path');
const options = require('./../../assets/js/options');

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
        const Tenmentdata = [];
        const Paymentdata = [];
        for (var i = 0; i < (req.session.user)[0].tenment.length; i++) {
            Tenmentdata.push(await TenamentDB.find({ tenament: (req.session.user)[0].tenment[i] }));
            Paymentdata.push(await paymentDB.find({ tenament: (req.session.user)[0].tenment[i] }));
        }
        res.status(200).render('bills', { title: "Bill Dashboard", User: (req.session.user)[0], Tenment: Tenmentdata, Payment: Paymentdata });
    }
}

exports.addTenment = async (req, res) => {
    try {
        const tenment = (req.session.user)[0].tenment;
        tenment.push(req.body.Tenment);
        const id = req.params.id;
        const data = {
            tenment: tenment
        }
        const updateData = await UserDB.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });

        res.status(200).redirect(`/user/AddTenament/${id}`);
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: "fail update"
        });
    }
}

exports.Tenment = async (req, res) => {
    try {
        const Tenmentdata = [];
        if (req.session.user) {
            for (var i = 0; i < (req.session.user)[0].tenment.length; i++) {
                Tenmentdata.push(await TenamentDB.find({ tenament: (req.session.user)[0].tenment[i] }));
            }
            res.status(200).render('addTenment', { title: "Add Tenment Dashboard", User: (req.session.user)[0], Tenment: Tenmentdata });
        }
        else {
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

exports.billDetails = async (req, res) => {
    try {
        if (req.session.user) {
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

exports.downloadReceipe = async (req, res) => {
    try {
        const html = fs.readFileSync(path.join(__dirname, './../../views/template.html'), 'utf-8');
        const filename = req.params.id + '_Payment' + '.pdf';

        var year = new Date().getFullYear();
        var tenment = await TenamentDB.find({ tenament: req.params.id });
        var Payment = await paymentDB.find({ $and: [{ tenament: req.params.id }, { paymentYear: year }] });
        // console.log(Payment, Payment.length);

        var document = {
            html: html,
            data: {
                tenament: tenment[0].tenament,
                Total: tenment[0].Total,
                Name: tenment[0].Name,
                Postal_address: tenment[0].Postal_address,
                Local_address: tenment[0].Local_address,
                Usage: tenment[0].Usage,
                Occupier: tenment[0].Occupier,
                Last_Bill_Issue_Date: tenment[0].Last_Bill_Issue_Date,
                Last_Bill_Due_Date: tenment[0].Last_Bill_Due_Date,
                Property_tax: tenment[0].Property_tax,
                Water_tax: tenment[0].Water_tax,
                Drainage_tax: tenment[0].Drainage_tax,
                SW_tax: tenment[0].SW_tax,
                Street_Light: tenment[0].Street_Light,
                Fire_Charge: tenment[0].Fire_Charge,
                Env_improve_charge: tenment[0].Env_improve_charge,
                Rebate: tenment[0].Rebate,
                Education_Cess: tenment[0].Education_Cess,
                Total: tenment[0].Total,
                Date: Payment[0].Date,
                Transcation_ID: Payment[0].Transcation_ID,
                Reference: Payment[0].Reference
            },
            path: './Download/' + filename,
            type: ""
        };

        res.status(200).render('template.ejs', { title: "Bill Recipe", User: (req.session.user)[0], Tenment: tenment[0], Payment: Payment[0] });
        // console.log(document.data.tenment);

        const PDF = await pdf.create(document, options)
        console.log(PDF);

    }
    catch (err) {
        res.status(404).json({
            status: 'fail'
        });
    }
}
