const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('Error🎗️: Application is Showting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './confing.env' }); // This will add all the config file varible to env object.........
const app = require('./app');

console.log(app.get('env')); //To check the envoriment variable and this is set by express.....
// console.log(process.env); // This is process.env set different envroment variable  by node js....
//Callback funtions...........
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`The server is running at port ${port}`);
});

process.on('unhandledRejection', (req, res, reason) => {
  console.error('Unhandled Promise Rejection 🎗️:', reason);

  // Handle the rejection here
});
