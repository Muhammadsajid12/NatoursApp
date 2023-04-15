const dotenv=require('dotenv')
dotenv.config({path:'./confing.env'}) // This will add all the config file varible to env object.........
const app = require('./app')

console.log( app.get( "env"));
// console.log( process.env)
//Callback funtions...........
const port =  process.env.PORT;
 app.listen(3000,()=>{
    console.log(`The server is running at port ${port}`);
 })