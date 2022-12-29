const dotenv = require('dotenv');
const http = require('http');


dotenv.config({ path: 'config.env' });

const app = require('./app');

const Server = http.createServer(app);
const PORT = process.env.PORT || 4000;
Server.listen(PORT, () => {
    console.log(`Server connected on port ${PORT} http://localhost:4000/`);
});