const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

//to set path of configiration file
dotenv.config({ path: './config.env' });

//------------ connection to database-------------------

// getting the connnection address   store in  env variables
const DB = process.env.DATABASE_LINK.replace('<password>', process.env.DATABASE_PASSWORD);

// port
const port = process.env.PORT || 3000;

// setting up the coneection
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(con => {
        console.log('database connected');
    })
    .catch(err => {
        console.log('Error  connecting to database :', err);
    });

app.listen(port, () => {
    console.log('server ready for request..');
});
