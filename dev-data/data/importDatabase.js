const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModel.js');
const User = require('./../../models/userModel.js');
const Review = require('./../../models/reviewModel.js');
//  data import function
const importData = async (data, data1, data2) => {
    try {
        await Tour.create(data);
        await User.create(data1, { validateBeforeSave: false });
        await Review.create(data2);
        console.log('loaded data');
        process.exit();
    } catch (err) {
        console.log('Error in data loading ', err);
    }
};

//Detlete exsinting data
const deleteData = async () => {
    try {
        await Tour.deleteMany({});
        await User.deleteMany({});
        await Review.deleteMany({});
        console.log('deleted all data');
        process.exit();
    } catch (err) {
        console.log('error in   databases', err);
    }
};

//-----------------------------------------main------------------------------------------

//  ------------- for setting up the coneection ---------------------

//to set path of configiration file
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);

//to read json data
//always will be from the current directory of the system not the   location of this
// file  soo  good practicr
const directory = __dirname + '/tours.json';
const directory1 = __dirname + '/users.json';
const directory2 = __dirname + '/reviews.json';

const data = JSON.parse(fs.readFileSync(directory, 'utf-8'));
const data1 = JSON.parse(fs.readFileSync(directory1, 'utf-8'));
const data2 = JSON.parse(fs.readFileSync(directory2, 'utf-8'));

//json parse so that the json data is inconverted into javascript objects

// coneecting to database
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false // someoptions to make development easy
    })
    .then(con => {
        console.log('Database connected');
        // for choosing between import n  delete of data in database
        if (process.argv[2] === '--import') {
            importData(data, data1, data2);
        }
        if (process.argv[2] === '--delete') {
            deleteData();
        }
    })
    .catch(err => {
        console.log(err);
    });
