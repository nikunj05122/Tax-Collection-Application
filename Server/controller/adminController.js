var { AdminDB, TenamentDB, paymentDB } = require('./../model/model');


exports.create = async (req, res) => {

    // validate request
    if (JSON.stringify(req.body) === '{}') {
        res.status(400).render('Admin_SignUp', { title: "Sign Up", alert: false });
        return;
    }

    const ConfirmPassword = req.body.ConfirmPassword;
    const Password = req.body.password;

    if (ConfirmPassword === Password) {
        try {
            const admin = await AdminDB.create(req.body);
            res.status(200).redirect('/admin/Login');
        } catch (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating a create operation."
            });
        }
    } else {
        res.status(500).render('Admin_SignUp', { title: "Sign Up", user: req.body, alert: true });
    }
}

exports.login = async (req, res) => {

    try {
        const data = await AdminDB.find({ $and: [{ email: req.body.email }, { password: req.body.password }] });
        if (data.length == 0) {
            res.status(500).render('Admin_Login', { title: "Login", alert: true });
        } else {
            req.session.user = data[0];
            const payData = await paymentDB.find({ Status: true });

            const year = [0, 0, 0, 0, 0];

            for (var i = 0; i < payData.length; i++) {
                if (payData[i].paymentYear == ('' + new Date().getFullYear())) {
                    year[4] += payData[i].Total;
                }
                else if (payData[i].paymentYear == ('' + (new Date().getFullYear() - 1))) {
                    year[3] += payData[i].Total;
                }
                else if (payData[i].paymentYear == ('' + (new Date().getFullYear() - 2))) {
                    year[2] += payData[i].Total;
                }
                else if (payData[i].paymentYear == ('' + (new Date().getFullYear() - 3))) {
                    year[1] += payData[i].Total;
                }
                else if (payData[i].paymentYear == ('' + (new Date().getFullYear() - 4))) {
                    year[0] += payData[i].Total;
                }
            }

            const tenmentData = await TenamentDB.find({ Status: true });
            const tenData = [0, 0, 0, 0, 0, 0, 0, 0]
            for (var i = 0; i < tenmentData.length; i++) {
                tenData[0] += tenmentData[i].Property_tax;
                tenData[1] += tenmentData[i].Water_tax;
                tenData[2] += tenmentData[i].Drainage_tax;
                tenData[3] += tenmentData[i].SW_tax;
                tenData[4] += tenmentData[i].Street_Light;
                tenData[5] += tenmentData[i].Fire_Charge;
                tenData[6] += tenmentData[i].Env_improve_charge;
                tenData[7] += tenmentData[i].Education_Cess;
            }

            const correntYearData = await TenamentDB.find();
            // console.log(correntYearData, correntYearData[0].Taluka);
            const taluka = new Set();
            for (var i = 0; i < correntYearData.length; i++) {
                taluka.add(correntYearData[i].Taluka);
            }

            const userBill = new Map();
            taluka.forEach((TalukaName) => {
                userBill.set(TalukaName, []);
            });

            taluka.forEach((TalukaName) => {
                for (var i = 0; i < correntYearData.length; i++) {
                    if (TalukaName == correntYearData[i].Taluka) {
                        userBill.get(TalukaName).push(correntYearData[i]);
                        // console.log(userBill.get(TalukaName));
                    }
                }
            });

            res.status(200).render('DashBoard', { title: "DashBoard", User: req.session.user, year: year, tenData: tenData, userBill: userBill })
        }
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: 'Please Re-Login... '
        });
    }
}

exports.addPayment = async (req, res) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const tenament = req.body.tenament;
    const Status = true;
    const Total = req.body.Property_size * 4 + ((Math.random() * 400) + 50) + (((Math.random() * 800) + 150) * 2) + 150 + 1245 + 100;
    const paymentYear = req.body.paymentYear;
    const date = `${(((Math.random()) * 32) + 1).toFixed(0)}/${req.body.month}/${req.body.paymentYear}  ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
    const Transcation_ID = (Math.random() * 999999999999999999) + 111111111111111111;
    const Reference = "" + characters.charAt(Math.floor(Math.random() * 26)) + (Math.floor(Math.random() * 100) + 10) + characters.charAt(Math.floor(Math.random() * 26)) + (Math.floor(Math.random() * 1000) + 100) + characters.charAt(Math.floor(Math.random() * 26)) + characters.charAt(Math.floor(Math.random() * 26)) + (Math.floor(Math.random() * 10) + 1);

    const payment = {
        tenament: tenament,
        Status: Status,
        Total: Total.toFixed(0) * 1,
        paymentYear: paymentYear,
        Date: date,
        Transcation_ID: Transcation_ID,
        Reference: Reference
    }
    try {
        const paymentData = await paymentDB.create(payment);
        res.status(200).json({
            status: 'Success',
            data: paymentData
        });
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: 'Payment entry fail'
        });
    }
}

exports.tenmentAndPaymentEntry = async (req, res) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const tenament = req.body.tenament;
    const Taluka = req.body.Taluka;
    const Name = req.body.Name;
    const Postal_address = req.body.Postal_address;
    const Local_address = req.body.Local_address;
    const Usage = req.body.Usage;
    const Occupier = req.body.Occupier;
    const Property_size = req.body.Property_size * 1;
    const Property_tax = req.body.Property_size * 4;
    const Water_tax = (Math.random() * 800) + 150;
    const Drainage_tax = (Math.random() * 400) + 50;
    const SW_tax = (Math.random() * 800) + 150;
    const Rebate = ((-1) * (Math.random() * 50) + 0);
    const Education_Cess = (Property_tax + Water_tax + Drainage_tax + SW_tax + 100 + 1245 + 30) * (0.05);
    const Total = Property_tax + Water_tax + Drainage_tax + SW_tax + 150 + 1245 + 100 + Rebate + Education_Cess;
    const Status = req.body.Status;
    const Transcation_ID = (Math.random() * 999999999999999999) + 111111111111111111;
    const Reference = "" + characters.charAt(Math.floor(Math.random() * 26)) + (Math.floor(Math.random() * 100) + 10) + characters.charAt(Math.floor(Math.random() * 26)) + (Math.floor(Math.random() * 1000) + 100) + characters.charAt(Math.floor(Math.random() * 26)) + characters.charAt(Math.floor(Math.random() * 26)) + (Math.floor(Math.random() * 10) + 1);
    const paymentYear = (new Date().getFullYear());

    const tenmentData = {
        tenament: tenament,
        Taluka: Taluka,
        Name: Name,
        Postal_address: Postal_address,
        Local_address: Local_address,
        Usage: Usage,
        Occupier: Occupier,
        Property_size: Property_size,
        Property_tax: Property_size * 8,
        Water_tax: Water_tax.toFixed(2) * 1,
        Drainage_tax: Drainage_tax.toFixed(2) * 1,
        SW_tax: SW_tax.toFixed(2) * 1,
        Rebate: Rebate.toFixed(2) * 1,
        Education_Cess: Education_Cess.toFixed(2) * 1,
        Total: Total.toFixed(0) * 1,
        Status: Status
    }

    const paymentData = {
        tenament: tenament,
        Status: Status,
        Total: Total.toFixed(0) * 1,
        paymentYear: paymentYear,
        Date: (Status) ? `${new Date().getDay() + 11}/${new Date().getMonth() + 1}/${new Date().getFullYear()}  ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}` : 'Payment is Panding..',
        Transcation_ID: (Status) ? Transcation_ID : 0,
        Reference: (Status) ? Reference : "Payment is Panding.."
    }
    try {
        const Tenment = await TenamentDB.create(tenmentData);
        const payment = await paymentDB.create(paymentData);
        res.status(200).json({
            message: {
                Tenment,
                payment
            }
        });
    } catch (err) {
        res.status(500).json({
            message: 'Data not inserted in the Tenament Database'
        });
    }
}
