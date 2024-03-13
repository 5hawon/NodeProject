//dependencies

const data = require('../../lib/data');
const {hash} =require('../../helpers/utilities');
const {parseJSON, createRandomString} =require('../../helpers/utilities')
const tokenHandler =require('./tokenHandler');
const {maxChecks} =require('../../helpers/environment')

// Module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethod = ['put', 'post', 'get', 'delete'];
    if (acceptedMethod.indexOf(requestProperties.method) > -1) {
        // Check if `_check` is defined before accessing its properties
        if (handler._check && handler._check[requestProperties.method]) {
            handler._check[requestProperties.method](requestProperties, callback);
        } else {
            callback(405);
        }
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    // Handle POST request
    //validate input
    let protocol = typeof(requestProperties.body.protocol)=== 'string' && ['http','https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol:false;
    let url = typeof(requestProperties.body.url)=== 'string' && requestProperties.body.url.trim().length>0 ? requestProperties.body.url:false;
    let method = typeof(requestProperties.body.method)=== 'string' && ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method)>-1 ? requestProperties.body.method:false;
    let successCodes = typeof(requestProperties.body.successCodes)=== 'object' && requestProperties.body.successCodes instanceof Array  ? requestProperties.body.successCodes:false;
    let timeOutSeconds = typeof(requestProperties.body.timeOutSeconds)=== 'number' && requestProperties.body.timeOutSeconds % 1===0 && requestProperties.body.timeOutSeconds>=1 && requestProperties.body.timeOutSeconds <=5 ? requestProperties.body.timeOutSeconds:false;
    
    if(protocol && url && method && successCodes && timeOutSeconds){
        let token= typeof(requestProperties.headersObject.token)==='string' ? requestProperties.headersObject.token: false;

        //lookup the user phone by token
        data.read('tokens',token,(err1,tokenData)=>{
            if(!err1 && tokenData)
            {
                let userPhone =parseJSON(tokenData).phone;
                //lookup the user

                data.read('users', userPhone,(err2,userData) =>{
                    if(!err2 && userData){
                        tokenHandler._token.verify(token,  userPhone, (tokenIsValid)=>{
                            if(tokenIsValid){
                                let userObject = parseJSON(userData);
                                let userChecks = typeof(userObject.checks) ==='object' &&  userObject.checks instanceof Array  ? userObject.checks :[];


                                if(userChecks.length< maxChecks){
                                    let checkId = createRandomString(20);

                                    let checkObject ={
                                        'id' : checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeOutSeconds,
                                    }
                                    //save the check object
                                    data.create('checks', checkId, checkObject, (err3)=>{
                                        if(!err3){
                                            //add check id to the users object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            //save the new user data
                                            data.update('users',userPhone, userObject,(err4)=>{
                                                if(!err4){
                                                    //retur the data about new check
                                                    callback(200, checkObject);

                                                }
                                                else{
                                                    callback(500,{
                                                        'error': 'Server side issues',
                                                    })

                                                }
                                            });

                                        }
                                        else{
                                            callback(500,{
                                                'error': 'Server side issues',
                                            })

                                        }
                                    });


                                }
                                else{
                                    callback(401,{
                                        'error': 'User has reached maximum number of checks',
                                    })
                                }



                            }
                            else{
                                callback(403,{
                                    'error': 'Authentication Problem',
                                })

                            }
                        })

                    }
                    else{
                        callback(403,{
                            'error': 'user not found',
                        })

                    }
                })

            }
            else{
                callback(403,{
                    'error': 'Authentication Problem',
                })
            }
        })

    }
    else{
        callback(400,{
            
            'error': 'problem with input',
        })
    }
    
    
};

handler._check.get = (requestProperties, callback) => {
    // Handle GET request
    const id= typeof(requestProperties.queryStringObject.id)==='string' && requestProperties.queryStringObject.id.trim().length===20 ? requestProperties.queryStringObject.id:false;
    if(id){
        data.read('checks',id, (err, checkData)=>{
            if(!err&&checkData){
                const token= typeof(requestProperties.headersObject.token)==='string' ? requestProperties.headersObject.token: false;
                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid)=>{
                    if(tokenIsValid){
                        callback(200,parseJSON(checkData));

                    }
                    else{
                        callback(403,{
                            'error':' you have a problem with your Auth',
                        })

                    }
                });



            }
            else{
                callback(500,{
                    'error':' you have a problem with server',
                })

            }
        })

    }
    else{
        callback(400,{
            'error':' you have a problem with your request',
        })
    }
};

handler._check.put = (requestProperties, callback) => {
    // Handle PUT request
    const id= typeof(requestProperties.body.id)==='string' && requestProperties.body.id.trim().length===20 ? requestProperties.body.id:false;
    let protocol = typeof(requestProperties.body.protocol)=== 'string' && ['http','https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol:false;
    let url = typeof(requestProperties.body.url)=== 'string' && requestProperties.body.url.trim().length>0 ? requestProperties.body.url:false;
    let method = typeof(requestProperties.body.method)=== 'string' && ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method)>-1 ? requestProperties.body.method:false;
    let successCodes = typeof(requestProperties.body.successCodes)=== 'object' && requestProperties.body.successCodes instanceof Array  ? requestProperties.body.successCodes:false;
    let timeOutSeconds = typeof(requestProperties.body.timeOutSeconds)=== 'number' && requestProperties.body.timeOutSeconds % 1===0 && requestProperties.body.timeOutSeconds>=1 && requestProperties.body.timeOutSeconds <=5 ? requestProperties.body.timeOutSeconds:false;
    
    if(id){
        if(protocol || url|| method|| successCodes|| timeOutSeconds){
            data.read('checks', id, (err1,checkData)=>{
                if(!err1 && checkData){
                    let checkObject =parseJSON(checkData);
                    let token= typeof(requestProperties.headersObject.token)==='string' ? requestProperties.headersObject.token: false;
                    tokenHandler._token.verify(token,  checkObject.userPhone, (tokenIsValid)=>{
                        if(tokenIsValid) {
                            if(protocol){
                                checkObject.protocol = protocol;

                            }
                            if(url){
                                checkObject.url = url;

                            }
                            if(method){
                                checkObject.method = method;

                            }
                            if(successCodes){
                                checkObject.successCodes = successCodes;

                            }
                            if(timeOutSeconds){
                                checkObject.timeOutSeconds = timeOutSeconds;

                            }

                            data.update('checks',id,checkObject,(err2)=>{
                                if(!err2){
                                    callback(200);

                                }
                                else{
                                    callback(500,{
                                        'error':' you have a problem with your server',
                                    })
                                }
                            })



                        }
                        else{
                            callback(403,{
                                'error':' Auth error',
                            })
                        }

                    });


                }
                else{
                    callback(500,{
                        'error':' you have a problem with your server',
                    })
                }
            })

        }
        else{
            callback(400,{
                'error':' you must filled at least one field to update',
            })
        }


    }
    else{
        callback(400,{
            'error':'Problem qith request',
        })

    }

};

handler._check.delete = (requestProperties, callback) => {
    // Handle DELETE request
    const id= typeof(requestProperties.queryStringObject.id)==='string' && requestProperties.queryStringObject.id.trim().length===20 ? requestProperties.queryStringObject.id:false;
    if(id){
        data.read('checks',id, (err, checkData)=>{
            if(!err&&checkData){
                const token= typeof(requestProperties.headersObject.token)==='string' ? requestProperties.headersObject.token: false;
                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid)=>{
                    if(tokenIsValid){

                        // delete the check data
                        data.delete('checks',id, (err1)=>{
                            if(!err1){
                                data.read('users',parseJSON(checkData).userPhone,(err2,userData)=>{
                                    let userObject =parseJSON(userData);
                                    if(!err2 && userData){
                                        let userChcecks = typeof(userObject.checks) ==='object' && userObject.checks instanceof Array ? userObject.checks : [];

                                        //remove the deleted check id from the user 
                                        let checkPosition=userChcecks.indexOf(id);

                                        if(checkPosition>-1){
                                            userChcecks.splice(checkPosition,1);

                                            //resave the user Data
                                            userObject.checks= userChcecks;
                                            data.update('users',userObject.phone, userObject, (err4)=>{
                                                if(!err4){
                                                    callback(200);

                                                }
                                                else{
                                                    callback(500,{
                                                        'error':' you have a problem with your server',
                                                    })
                                                }

                                            });

                                        }
                                        else{
                                            callback(500,{
                                                'error':' id is not found',
                                            })


                                        }


                                    }
                                    else{
                                        callback(500,{
                                            'error':' you have a problem with your server',
                                        })

                                    }
                                })

                            }
                            else{
                                callback(500,{
                                    'error':' you have a problem with your server',
                                })
                            }

                        })
                        callback(200,parseJSON(checkData));

                    }
                    else{
                        callback(403,{
                            'error':' you have a problem with your Auth',
                        })

                    }
                });



            }
            else{
                callback(500,{
                    'error':' you have a problem with server',
                })

            }
        })

    }
    else{
        callback(400,{
            'error':' you have a problem with your request',
        })
    }


};

module.exports = handler;

