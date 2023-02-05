const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const DB = process.env.DATABASE_URL.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

const connectDB = async () => {
    try {
        const con = await mongoose.connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB connected : Connected`);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

module.exports = connectDB;