const express = require('express');
const routesUser = require('./Server/routes/routesUser');
const routesAdmin = require('./Server/routes/routesAdmin');
const connectDB = require('./Server/database/connection');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

const app = express();

// log request
// app.use(morgan('tiny'));
// app.use(morgan('dev'));

// Database connect
connectDB();

// For get body data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// set view engine
app.set('view engine', 'ejs');

// load assets
app.use('/css', express.static(path.resolve(__dirname, 'assets/css')));
app.use('/img', express.static(path.resolve(__dirname, 'assets/img')));
app.use('/js', express.static(path.resolve(__dirname, 'assets/js')));
app.use('/Download', express.static(path.join(__dirname, 'Download')));

// session for login
app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
}));

// Routes for user
app.use('/user', routesUser);
app.use('/admin', routesAdmin);
app.use('/', routesUser);

module.exports = app;