const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

//to set path of configiration file
dotenv.config({ path: './config.env' });

//------------ connection to database-------------------

// getting the connnection address   store in  env variables
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);

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

app.listen(8080, () => {
    console.log('server ready for request..');
});
