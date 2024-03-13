
//dependencies
const {StringDecoder} = require('string_decoder');
const url = require('url');
const routes= require('../routes');
const {notfoundHandler}= require('../handlers/routeHandlers/notfoundHandler')
const {parseJSON} =require('./utilities')

const handler={};

handler.handleReqRes = (req, res)=>{
    //request handle 
    //get the url and parse it
    const parsedUrl=url.parse(req.url,true);
    console.log(parsedUrl);
    const path=parsedUrl.pathname;
    const trimmedPath= path.replace(/^\/+|\/+$/g, '');

    console.log(trimmedPath);
    const method=req.method.toLowerCase();
    console.log(method);
    const queryStringObject=parsedUrl.query;
    // console.log(queryStringObject);
    const headersObject=req.headers;
    console.log(headersObject);

    const decoder= new StringDecoder('utf-8');

    const requestProperties={
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headersObject,
    }
    let realData='';

    const chosenHandler= routes[trimmedPath] ? routes[trimmedPath] : notfoundHandler; 

    req.on('data',(buffer)=>{
        realData+= decoder.write(buffer);
    });

    req.on('end',()=>{
        realData+= decoder.end();
        requestProperties.body = parseJSON(realData);
        
        chosenHandler(requestProperties, (statusCode, payload)=>{
            statusCode = typeof (statusCode) === 'number' ? statusCode : 500;
            payload = typeof (payload) === 'object' ? payload : {};
    
            const payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type' , 'application/json');
    
            res.writeHead(statusCode);
            console.log(payloadString);
            res.end(payloadString);
        });
    });
};

module.exports= handler;
