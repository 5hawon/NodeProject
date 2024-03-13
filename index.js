/*
Title : Node Project
Name: Md. Sajjad Hossain
Date: 4-3-24
Semester Break 
*/

//dependencies
const server = require('./lib/server');
const workers = require('./lib/worker');

//app object scaffolding
const app={};

app.init =()=>{
    //start the server
    server.init();


    //start the workers
    workers.init();
}
app.init();

module.exports = app;
// // todo remove later
// sendTwiloSms('01521526826','Hi Babyyy',(err)=>{
//     console.log(err);
// })


//TODO 
//testing file system
// data.create('test','newfile2', {'name':'bangladesh', 'lang':'bangla'}, (err) =>{
//     console.log('error was'+err);
// })
//read
// data.read('test','newfile2', (err,data) =>{
//     console.log(err, data);
// })
// data.update('test','newfile2',{'name':'bangladesh','lang':'eng'}, (err) =>{
//     console.log(err);
// })