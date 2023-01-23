var { AdminDB, TenamentDB, paymentDB, UserDB } = require('./../model/model');


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
            res.status(200).redirect(`/admin/dashBoard`);
        }
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: 'Please Re-Login... '
        });
    }
}

exports.dashBoard = async (req, res) => {
    try {
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

        // // console.log(req.params.tenment);
        // // const arr = [...req.query]
        // const len = Object.values(req.query);
        // // console.log(len);
        // const searchTenament = len.length ? await TenamentDB.find(req.query) : undefined;
        // // console.log(req.query, searchTenament, req.params.s);
        if (req.session.user) {
            res.status(200).render('DashBoard', { title: "DashBoard", User: req.session.user, year: year, tenData: tenData, userBill: userBill });
        } else {
            res.status(500).json({
                status: 'Fail',
                message: 'Please Re-Login... '
            });
        }
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: 'Login... Fail'
        });
    }
}

exports.search = async (req, res) => {
    // console.log(req.body.tenment);
    // res.status(200).redirect(`/admin/dashBoard/1?tenament=${req.body.tenment}`);

    try {
        if (req.session.user) {
            // const { tenament } = req.body;
            // console.log(req.body);

            const searchData = await TenamentDB.find(req.body);
            // console.log(searchData);
            res.status(200).json({ data: searchData[0] });
        }
        else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }
    } catch (err) {
        res.status(500).json({
            status: "Fail to get data for serch bar",
            message: err
        });
    }
}

exports.searchUser = async (req, res) => {
    try {
        if (req.session.user) {
            // const { tenament } = req.body;
            // console.log(req.body);

            const searchData = await UserDB.find(req.body);
            // console.log(searchData);
            res.status(200).json({ data: searchData[0] });
        }
        else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }
    } catch (err) {
        res.status(500).json({
            status: "Fail to get data for serch bar",
            message: err
        });
    }
}

exports.details = async (req, res) => {
    try {
        if (req.session.user) {
            const userData = await UserDB.find({ tenment: req.params.tenment });
            const tenmentData = await TenamentDB.find({ tenament: req.params.tenment });
            const paymentData = await paymentDB.find({ tenament: req.params.tenment })

            res.status(200).render('Details', { title: "Details", User: req.session.user, TenmentDetails: tenmentData[0], UserDetails: userData[0], PaymentDetails: paymentData })
        }
        else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }

    } catch (err) {
        res.status(500).json({
            message: 'Details is not get from the database'
        });
    }
}

exports.adminProfile = async (req, res) => {
    try {
        if (req.session.user) {
            const id = req.session.user._id;

            var data = await AdminDB.findById(id);
            res.status(200).render('adminPage', { title: "User Details", User: data });
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

exports.adminProfileEdit = async (req, res) => {
    try {
        if (req.session.user) {
            const id = req.session.user._id;

            var data = await AdminDB.findById(id);
            res.status(200).render('adminEditPage', { title: "User Details", User: data });
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

exports.adminProfileEditSubmit = async (req, res) => {
    try {
        if (req.session.user) {
            const id = req.session.user._id;
            const data = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            }

            // console.log(id, data);
            const update = await AdminDB.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true
            });

            // console.log(update);

            res.status(200).redirect(`/admin/dashBoard/adminProfile`);
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

exports.userDetails = async (req, res) => {
    try {
        if (req.session.user) {
            const userData = await UserDB.find();
            // console.log(userData[0]._id.valueOf());
            res.status(200).render('User_Details', { title: "User Details", User: req.session.user, userData: userData });
        }
        else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }

    } catch (err) {
        res.status(500).json({
            message: 'Details is not get from the database'
        });
    }
}

exports.userDetailsEdit = async (req, res) => {
    try {
        if (req.session.user) {
            const id = req.params.id;
            const userData = await UserDB.findById(id);
            // console.log(userData);
            res.status(200).render('User_Details_Edit', { title: "Add Tenment Details", User: req.session.user, userData: userData });
        }
        else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }

    } catch (err) {
        res.status(500).json({
            message: 'Edit page not reneder'
        });
    }
}

exports.userDetailsAdd = async (req, res) => {
    try {
        if (req.session.user) {
            const id = req.params.id;

            const oldUserData = await UserDB.findById(id);
            // console.log(oldUserData);
            const Tenment = oldUserData.tenment;
            Tenment.push(req.body.tenament);

            const data = {
                tenment: Tenment
            }
            const updateData = await UserDB.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true
            });

            res.status(200).redirect(`/admin/dashBoard/userDetailsEdit/${id}`);
        }
        else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }

    } catch (err) {
        res.status(500).json({
            message: 'User Details is not updated'
        });
    }
}

exports.userDetailsRemove = async (req, res) => {
    try {
        if (req.session.user) {
            const id = req.params.id;

            const oldUserData = await UserDB.findById(id);
            // console.log(oldUserData.tenment);
            const Tenment = [];

            for (var i = 0; i < oldUserData.tenment.length; i++)
                if (oldUserData.tenment[i] != req.body.tenament)
                    Tenment.push(oldUserData.tenment[i]);

            console.log(Tenment);
            const data = {
                tenment: Tenment
            }
            const updateData = await UserDB.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true
            });

            res.status(200).redirect(`/admin/dashBoard/userDetailsEdit/${id}`);
        }
        else {
            res.status(500).json({
                status: "Fail",
                message: "Please Re-Login..."
            });
        }

    } catch (err) {
        res.status(500).json({
            message: 'User Details is not updated'
        });
    }
}
// exports.addPayment = async (req, res) => {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

//     const tenament = req.body.tenament;
//     const Status = true;
//     const Total = req.body.Property_size * 4 + ((Math.random() * 400) + 50) + (((Math.random() * 800) + 150) * 2) + 150 + 1245 + 100;
//     const paymentYear = req.body.paymentYear;
//     const date = `${(((Math.random()) * 32) + 1).toFixed(0)}/${req.body.month}/${req.body.paymentYear}  ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
//     const Transcation_ID = (Math.random() * 999999999999999999) + 111111111111111111;
//     const Reference = "" + characters.charAt(Math.floor(Math.random() * 26)) + (Math.floor(Math.random() * 100) + 10) + characters.charAt(Math.floor(Math.random() * 26)) + (Math.floor(Math.random() * 1000) + 100) + characters.charAt(Math.floor(Math.random() * 26)) + characters.charAt(Math.floor(Math.random() * 26)) + (Math.floor(Math.random() * 10) + 1);

//     const payment = {
//         tenament: tenament,
//         Status: Status,
//         Total: Total.toFixed(0) * 1,
//         paymentYear: paymentYear,
//         Date: date,
//         Transcation_ID: Transcation_ID,
//         Reference: Reference
//     }
//     try {
//         const paymentData = await paymentDB.create(payment);
//         res.status(200).json({
//             status: 'Success',
//             data: paymentData
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: 'Fail',
//             message: 'Payment entry fail'
//         });
//     }
// }

// exports.tenmentAndPaymentEntry = async (req, res) => {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

//     const tenament = req.body.tenament;
//     const Taluka = req.body.Taluka;
//     const Name = req.body.Name;
//     const Postal_address = req.body.Postal_address;
//     const Local_address = req.body.Local_address;
//     const Usage = req.body.Usage;
//     const Occupier = req.body.Occupier;
//     const Property_size = req.body.Property_size * 1;
//     const Property_tax = req.body.Property_size * 4;
//     const Water_tax = (Math.random() * 800) + 150;
//     const Drainage_tax = (Math.random() * 400) + 50;
//     const SW_tax = (Math.random() * 800) + 150;
//     const Rebate = ((-1) * (Math.random() * 50) + 0);
//     const Education_Cess = (Property_tax + Water_tax + Drainage_tax + SW_tax + 100 + 1245 + 30) * (0.05);
//     const Total = Property_tax + Water_tax + Drainage_tax + SW_tax + 150 + 1245 + 100 + Rebate + Education_Cess;
//     const Status = req.body.Status;
//     const Transcation_ID = (Math.random() * 999999999999999999) + 111111111111111111;
//     const Reference = "" + characters.charAt(Math.floor(Math.random() * 26)) + (Math.floor(Math.random() * 100) + 10) + characters.charAt(Math.floor(Math.random() * 26)) + (Math.floor(Math.random() * 1000) + 100) + characters.charAt(Math.floor(Math.random() * 26)) + characters.charAt(Math.floor(Math.random() * 26)) + (Math.floor(Math.random() * 10) + 1);
//     const paymentYear = (new Date().getFullYear());

//     const tenmentData = {
//         tenament: tenament,
//         Taluka: Taluka,
//         Name: Name,
//         Postal_address: Postal_address,
//         Local_address: Local_address,
//         Usage: Usage,
//         Occupier: Occupier,
//         Property_size: Property_size,
//         Property_tax: Property_size * 8,
//         Water_tax: Water_tax.toFixed(2) * 1,
//         Drainage_tax: Drainage_tax.toFixed(2) * 1,
//         SW_tax: SW_tax.toFixed(2) * 1,
//         Rebate: Rebate.toFixed(2) * 1,
//         Education_Cess: Education_Cess.toFixed(2) * 1,
//         Total: Total.toFixed(0) * 1,
//         Status: Status
//     }

//     const paymentData = {
//         tenament: tenament,
//         Status: Status,
//         Total: Total.toFixed(0) * 1,
//         paymentYear: paymentYear,
//         Date: (Status) ? `${new Date().getDay() + 11}/${new Date().getMonth() + 1}/${new Date().getFullYear()}  ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}` : 'Payment is Panding..',
//         Transcation_ID: (Status) ? Transcation_ID : 0,
//         Reference: (Status) ? Reference : "Payment is Panding.."
//     }
//     try {
//         const Tenment = await TenamentDB.create(tenmentData);
//         const payment = await paymentDB.create(paymentData);
//         res.status(200).json({
//             message: {
//                 Tenment,
//                 payment
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             message: 'Data not inserted in the Tenament Database'
//         });
//     }
// }