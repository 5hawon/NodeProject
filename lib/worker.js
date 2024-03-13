/*
Title : Node Project
Name: Md. Sajjad Hossain
Date: 4-3-24
Semester Break 
*/

//dependencies
const data = require('./data');
const {parseJSON} = require('../helpers/utilities');
const url =require('url');
const http = require('http');
const https = require('https');
const {sendTwiloSms} =require('../helpers/notification');


//app object scaffolding
const worker={};

//lookup all the checks
worker.gatherAllChecks = ()=>{
    //get all the checks
    data.list('checks',(err,checks)=>{
        if(!err && checks&& checks.length>0){
            checks.forEach(check =>{
                data.read('checks',check,(err1,orginalCheckData)=>{
                    if(!err1 && orginalCheckData){
                        //pass the data to the check validator
                        worker.validateCheckData(parseJSON(orginalCheckData));

                    }
                    else{
                        console.log(orginalCheckData);
                        console.log('error readoing one of the checks checks');
                    }
                })

            });

        }
        else{
            console.log('could not find checks');
        }
    })

}

//validate individual check data
worker.validateCheckData = (orginalCheckData)=>{

    if(orginalCheckData && orginalCheckData.id){
        
        orginalCheckData.state = typeof(orginalCheckData.state)==='string' && ['up'&&'down'].indexOf(orginalCheckData.state)>-1 ? orginalCheckData.state : 'down';

        orginalCheckData.lastChecked =typeof(orginalCheckData.lastChecked)==='number' && orginalCheckData.lastChecked>0?orginalCheckData.lastChecked: false;

        //pass to the next process
        worker.performCheck(orginalCheckData);

    }
    else{
        console.log('check was invalid');
    }
}

//perform check
worker.performCheck =()=>{
    //preapre the initial check outcome
    let checkOutCome={
        'error': false,
        'responseCode': false,

    };
    //mark the outcome has not been sent yet
    let outcomeSent = false;

    //parse the hostname
    let parsedUrl = url.parse(orginalCheckData.protocol+ '://'+orginalCheckData.url,tru);
    const hostname = parsedUrl.hostname;
    const path = parsedUrl.path;


    //construct tthe request
    const requestDetails ={
        'protocol':orginalCheckData.protocol + ':',
        'hostname':hostname,
        'method':orginalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': orginalCheckData.timeoutSeconds * 1000,


    };
    const protocolToUse = orginalCheckData.protocol ==='http' ? http : https;

    let req  = protocolToUse.request(requestDetails,(res)=>{
        //grab the status of the response
        const status = res.statusCode;

        //update the check outcome and pass to the next process
        checkOutCome.responseCode = status;
        if(!outcomeSent ){
            worker.processCheckOutcome(orginalCheckData,checkOutCome);
            outcomeSent=true;
        }


    });

    req.on('error',(e)=>{
         checkOutCome={
            error: true,
            value: e,
    
        };
        if(!outcomeSent ){
            worker.processCheckOutcome(orginalCheckData,checkOutCome);
            outcomeSent=true;
        }

    })
    req.on('timeout',(e)=>{
        checkOutCome={
            error: true,
            value: 'timeout',
    
        };
        if(!outcomeSent ){
            worker.processCheckOutcome(orginalCheckData,checkOutCome);
            outcomeSent=true;
        }

        
    })
    //send req
    req.end()

}
//send notification sms to user
worker.alertUserToStatusChange = (newCheckData) =>{
    let msg ='Alert: Your check for'+newCheckData.method.toUpperCase()+' '+newCheckData.protocol+'://'+newCheckData.url+' is currently '+newCheckData.state;
    sendTwiloSms(newCheckData.userPhone, msg,(err)=>{
        if(!err){
            console.log('user was alerted to status change ='+msg);

        }
        else{
            console.log('There was a problem sending message to');
        }

    })

}
//save check outcome to database and send to next process
worker.processCheckOutcome = ()=>{
    //check if checkOutcome is up or down
    let state = !checkOutcome.error && checkOutCome.responseCode && orginalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1? 'up': 'down';

    //decide we should alert the user or not
    let alertWanted = orginalCheckData.lastChecked && orginalCheckData.state !== state ? true : false;

    //update the checkData
    let newCheckData = orginalCheckData;
    newCheckData.state=state;
    newCheckData.lastChecked = Date.now();

    //update the check to Disk
    data.update('checks', newCheckData.id, newCheckData,(err)=>{
        if(!err){
            //send the checkdata next process
            if(alertWanted){
                worker.alertUserToStatusChange(newCheckData)
            }
            else{
                console.log('alert is not needed as no state change');
            }
           

        }
        else{
            console.log('error: trying to save');
        }
    });
}


//timer function
worker.loop =()=>{
    setInterval(()=>{
        worker.gatherAllChecks()


    },1000*60)
}

//start server
worker.init =()=>{
    console.log('worker started');
    worker.gatherAllChecks()

    //call the loop so that check contiuues
    worker.loop();

}

module.exports=worker;