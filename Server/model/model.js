const mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    tenment: [{
        type: String,
        default: ''
    }],
    number: {
        type: Number,
        required: true,
        unique: true
    },
    code: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const UserDB = mongoose.model("UserDB", UserSchema);

var TempUserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    tenment: [{
        type: String,
        default: ''
    }],
    number: {
        type: Number,
        required: true,
        unique: true
    },
    code: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    OTP: {
        type: Number,
        required: true
    }
});

const TempUserDB = mongoose.model("TempUserDB", TempUserSchema);

var AdminSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    post: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const AdminDB = mongoose.model("AdminDB", AdminSchema);

var TempAdminSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    post: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    OTP: {
        type: Number,
        required: true
    }
});

const TempAdminDB = mongoose.model("TempAdminDB", TempAdminSchema);

var TenamentSchema = mongoose.Schema({
    tenament: {
        type: String,
        required: true,
        unique: true
    },
    Taluka: {
        type: String,
        required: true,
    },
    Name: {
        type: String,
        required: true
    },
    Postal_address: {
        type: String,
        required: true
    },
    Local_address: {
        type: String,
        required: true
    },
    Usage: {
        type: String,
        required: true
    },
    Occupier: {
        type: String,
        require: true
        // default: ['Self', 'Tenant']
    },
    Property_Width: {
        type: Number,
        required: true
    },
    Property_Length: {
        type: Number,
        required: true
    },
    Property_tax: {
        type: Number,
        required: true
    },
    Water_tax: {
        type: Number,
        required: true
    },
    Drainage_tax: {
        type: Number,
        required: true
    },
    SW_tax: {
        type: Number,
        required: true
    },
    Street_Light: {
        type: Number,
        required: true,
        default: 150
    },
    Fire_Charge: {
        type: Number,
        required: true,
        default: 1245
    },
    Env_improve_charge: {
        type: Number,
        required: true,
        default: 100
    },
    Rebate: {
        type: Number,
        required: true
    },
    Education_Cess: {
        type: Number,
        required: true
    },
    Total: {
        type: Number,
        required: true
    },
    Status: {
        type: Boolean,
        required: true,
        default: false
    }
});

const TenamentDB = mongoose.model("TenamentDB", TenamentSchema);

var PandingTenamentSchema = mongoose.Schema({
    tenament: {
        type: String,
        required: true,
        unique: true
    },
    Taluka: {
        type: String,
        required: true,
    },
    Name: {
        type: String,
        required: true
    },
    Postal_address: {
        type: String,
        required: true
    },
    Local_address: {
        type: String,
        required: true
    },
    Usage: {
        type: String,
        required: true
    },
    Occupier: {
        type: String,
        require: true
    },
    Property_Width: {
        type: Number,
        required: true
    },
    Property_Length: {
        type: Number,
        required: true
    },
    Property_tax: {
        type: Number,
        required: true
    },
    Water_tax: {
        type: Number,
        required: true
    },
    Drainage_tax: {
        type: Number,
        required: true
    },
    SW_tax: {
        type: Number,
        required: true
    },
    Street_Light: {
        type: Number,
        required: true,
        default: 150
    },
    Fire_Charge: {
        type: Number,
        required: true,
        default: 1245
    },
    Env_improve_charge: {
        type: Number,
        required: true,
        default: 100
    },
    Rebate: {
        type: Number,
        required: true
    },
    Education_Cess: {
        type: Number,
        required: true
    },
    Total: {
        type: Number,
        required: true
    },
    Status: {
        type: Boolean,
        required: true,
        default: false
    },
    year: {
        type: Number,
        required: true
    }
});

const PandingTenamentDB = mongoose.model("PandingTenamentDB", PandingTenamentSchema);

const paymentSchema = mongoose.Schema({
    tenament: {
        type: String,
        required: true
    },
    Status: {
        type: Boolean,
        required: true,
        default: false
    },
    Total: {
        type: Number,
        required: true
    },
    paymentYear: Number,
    Date: String,
    Transcation_ID: String,
    Reference: String
});

const paymentDB = mongoose.model("paymentDB", paymentSchema);

module.exports = { UserDB, AdminDB, TenamentDB, paymentDB, TempAdminDB, TempUserDB, PandingTenamentDB };