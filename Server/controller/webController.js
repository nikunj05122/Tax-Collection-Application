var { TenamentDB, paymentDB } = require('./../model/model');

exports.TenamentDBPDFDownloadInMail = async (req, res) => {
    try {
        var year = new Date().getFullYear();
        const tenmentData = await TenamentDB.findById(req.params.id);
        const paymentData = await paymentDB.find({ $and: [{ tenament: tenmentData.tenament }, { paymentYear: year }] });

        res.status(200).render('template.ejs', { title: "Bill Recipe", Tenment: tenmentData, Payment: paymentData[0], year: year, withLogin: false });
    } catch (err) {
        res.status(500).json({
            status: "Fail to Download File Through mail",
            message: err
        });
    }
}