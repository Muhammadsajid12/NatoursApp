const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './confing.env' });
const Tour = require('../../model/tourModel');

const fs = require('fs');

// Here we getting the enviroment variable data Db Connecting stuff........👻👻👻
const DB = process.env.DATA_BASE.replace(
  '<PASSWORD>',
  process.env.DATA_BASE_PASSWORD
);
mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  // .connect('mongodb://localhost:27017/natours')
  .then(con => {
    // console.log(con.connection);
    console.log('db connected from import script👌👌  ');
  })
  .catch(err => console.log(err));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'Utf-8')
);
// console.log(tours);
//  IMPORT_DATA_INTO_DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data is imported successfully.....');
  } catch (error) {
    console.log('ERROR', error);
  }
  process.exit();
};

// DELETE THE DATA ...........
// node dev-data/data/importData.js --delete
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data is deleted successfully.....');
  } catch (error) {
    console.log('ERROR', error);
  }
  process.exit();
};

//RUN THIS COMMAND TO IMPORT THE DATA ...........
// node dev-data/data/importData.js --import
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv, 'process.argv'); //This will show the node directry and completepath of the file...
