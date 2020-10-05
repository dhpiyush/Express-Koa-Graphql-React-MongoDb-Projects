const fs = require('fs');
const mongoose = require('mongoose');
// const dotenv = require('dotenv');
const User = require('../models/userModel');
const config = require('config');

// console.log(process.env.NODE_ENV);
// const DB = config.get('dataBase.url').replace(
//     '<PASSWORD>',
//     password
// );

// //node ./dev-data/import-dev-data.js --import
const DB =  "mongodb+srv://m001-student:m001-mongodb-basics@sandbox.wxjro.mongodb.net/video?retryWrites=true&w=majority";
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
})
.then(() => console.log('DB connected succesfully'));
const testSchema = new mongoose.Schema({
    text: {
        type: String
    }
});
const Test = mongoose.model('Test', testSchema);
// const r = Review.create({
//     text: "test3"
// });


//read json
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));

//import data into db
const importData = async() =>{
    try {
        User.create(users, {validateBeforeSave: false}); // password is already encrypted so, turn off password encryption
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

//delete all data
const deleteData = async() =>{
    try {
        await Test.deleteMany();
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

if (process.argv[2] === '--import' ) {
    importData();
}else if (process.argv[2] === '--delete') {
    deleteData();
}
