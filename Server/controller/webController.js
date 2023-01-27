var { TenamentDB, paymentDB } = require('./../model/model');
const path = require('path');

const LOCAL_URL = 'http://localhost:4000';
// const LOCAL_URL = 'https://tax-collection.onrender.com';

exports.TenamentDBPDFDownloadInMail = async (req, res) => {
    try {
        var year = new Date().getFullYear();
        const tenmentData = await TenamentDB.findById(req.params.id);
        const paymentData = await paymentDB.find({ $and: [{ tenament: tenmentData.tenament }, { paymentYear: year }] });
        // res.status(200).json({
        //     message: "success",
        //     data: {
        //         tenmentData,
        //         Payment
        //     }
        // })
        res.status(200).render('template.ejs', { title: "Bill Recipe", Tenment: tenmentData, Payment: paymentData[0], year: year, withLogin: false });
    } catch (err) {
        res.status(500).json({
            status: "Fail to Download File Through mail",
            message: err
        });
    }
}