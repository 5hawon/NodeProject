/*
Title : Node Project
Name: Md. Sajjad Hossain
Date: 4-3-24
Semester Break 
*/

//dependencies
const http = require('http');
const {handleReqRes} = require('../helpers/handleReqRes');
const environment=require('../helpers/environment');
const data =require('../lib/data');
const{sendTwiloSms} =require('../helpers/notification');

//app object scaffolding
const server={};


server.config ={
    port: 3000,
}

//create Server 
server.createServer = ()=>{
    const createServerVariable=http.createServer(server.handleReqRes);
    createServerVariable.listen(environment.port,()=>{
        
        console.log('server listening on port '+environment.port);
    });

};



//handle request response
server.handleReqRes=handleReqRes;

//start server
server.init =()=>{
    server.createServer();

}

module.exports=server;