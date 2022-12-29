const dotenv = require('dotenv');

dotenv.config({ path: 'config.env' });

const app = require('./app');

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server connected on port ${PORT} http://localhost:4000/`);
});