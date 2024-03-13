//dependencies
const https = require('https');
const twilio = require('./environment');
const queystring =require('querystring');

//scafolding
const notification ={};

//send sms to user using twilo api

notification.sendTwiloSms =(phone, msg, callback)=>{
    //input validation

    const userPhone= typeof(phone) === 'string' && phone.trim().length ===11? phone.trim() : false;
    const usrMsg = typeof(msg) === 'string' && msg.trim().length>0 && msg.trim().length<=1600 ? msg.trim() : false;
    console.log(userPhone);
    console.log(usrMsg);

    if(userPhone&& usrMsg) {
        //configure the request payload
        const payload ={
            From : twilio.fromPhone,
            To: '+88'+userPhone,
            Body: usrMsg,

        }
        //stringify the payload
        const stringifyPayload = queystring.stringify(payload);


        //configure the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: '/2010-04-01/Accounts/ACf9cdb7ab2bfc9ffcc342bcb97681dcb5/Messages.json',
            auth: 'ACf9cdb7ab2bfc9ffcc342bcb97681dcb5:15b16171663af51b0549eac5bb427cf4',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        };
        
        const postData = 'To=+8801521526826&From=+16319934166&Body=Hello%2C%20World!'; // Adjust to your message details
        
        const req = https.request(requestDetails, (res) => {
            // Get the status of the sent request
            const status = res.statusCode;
            if (status === 200 || status === 201) {
                console.log('Message sent successfully');
            } else {
                console.error('Failed to send message. Status: ' + status);
            }
        
            res.on('data', (chunk) => {
                console.log('Response body: ' + chunk);
            });
        });
        
        req.on('error', (error) => {
            console.error('Error sending request: ' + error.message);
        });
        
        // Write data to request body
        req.write(postData);
        req.end();

        req.on('error', (err)=>{
            callback(err);
        })
        req.write(stringifyPayload);
        req.end();

    }
    else{
        callback("invalid phone and msg");
    }
  

}

module.exports = notification;

