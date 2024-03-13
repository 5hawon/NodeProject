//dependencies

const data = require('../../lib/data');
const {hash} =require('../../helpers/utilities');
const {parseJSON} =require('../../helpers/utilities')
const tokenHandler =require('./tokenHandler');

// Module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethod = ['put', 'post', 'get', 'delete'];
    if (acceptedMethod.indexOf(requestProperties.method) > -1) {
        // Check if `_users` is defined before accessing its properties
        if (handler._users && handler._users[requestProperties.method]) {
            handler._users[requestProperties.method](requestProperties, callback);
        } else {
            callback(405);
        }
    } else {
        callback(405);
    }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
    // Handle POST request
    const firstName= typeof(requestProperties.body.firstName)==='string' && requestProperties.body.firstName.trim().length>0 ? requestProperties.body.firstName:false;

    const lastName= typeof(requestProperties.body.lastName)==='string' && requestProperties.body.lastName.trim().length>0 ? requestProperties.body.lastName:false;
    
    const phone= typeof(requestProperties.body.phone)==='string' && requestProperties.body.phone.trim().length===11 ? requestProperties.body.phone:false;

    const password= typeof(requestProperties.body.password)==='string' && requestProperties.body.password.trim().length>0 ? requestProperties.body.password:false;

    const toAsAgreement= typeof(requestProperties.body.toAsAgreement)==='boolean'? requestProperties.body.toAsAgreement:false;
    console.log(firstName)


    
    if (firstName && lastName && phone && password && toAsAgreement)
    {
        //make sure that user doesn;t already exist
        data.read('users', phone, (err1, user) =>{
            if (err1)
            {
                // valo
                let userObject ={
                    firstName,
                    lastName,
                    phone,
                    password : hash(password),
                    toAsAgreement

                }
                // time to store
                data.create('users',phone, userObject, (err2) =>{
                    if(!err2)
                    {
                        callback(200,{
                            message:'User was successfully created',
                        });
                    }
                    else{
                        callback(500,{'error':'could not create user'})
                    }

                })
            }
            else{
                callback(500, {
                    'error' : 'server side issues',
                })
            }
        })

    }
    else
    {
        callback(400,{
            'error': firstName+' '+lastName+' '+phone+' '+toAsAgreement,

        });
    }
    
};

handler._users.get = (requestProperties, callback) => {
    // Handle GET request
    //check the phone number if valid
    const phone= typeof(requestProperties.queryStringObject.phone)==='string' && requestProperties.queryStringObject.phone.trim().length===11 ? requestProperties.queryStringObject.phone:false;
    if(phone){
        //verify token
        let token= typeof(requestProperties.headersObject.token)==='string' ? requestProperties.headersObject.token: false;
        tokenHandler._token.verify(token, phone,(tokenId)=>{
            if(tokenId){
                //lookup the user

        data.read('users',phone,(err,u) => {
            const user= {...parseJSON(u)};
            if(!err && user)
            {
                delete user.password;
                callback(200,   user);
            }
            else{
                callback(400,{
                    'error': 'requested user does not exist',
                });

            }
        })

            }
            else{
                callback(403,{
                    'error':'Authication failed',
                })
            }
        })
        

    }
    else{
        callback(400,{
            'error': 'requested user does not exist',
        });
    }

};

handler._users.put = (requestProperties, callback) => {
    // Handle PUT request
    const firstName= typeof(requestProperties.body.firstName)==='string' && requestProperties.body.firstName.trim().length>0 ? requestProperties.body.firstName:false;

    const lastName= typeof(requestProperties.body.lastName)==='string' && requestProperties.body.lastName.trim().length>0 ? requestProperties.body.lastName:false;
    
    const phone= typeof(requestProperties.body.phone)==='string' && requestProperties.body.phone.trim().length===11 ? requestProperties.body.phone:false;

    const password= typeof(requestProperties.body.password)==='string' && requestProperties.body.password.trim().length>0 ? requestProperties.body.password:false;

    if(phone){
        if(firstName || lastName || password){
            
            //lookup the user
            //verify token
        let token= typeof(requestProperties.headersObject.token)==='string' ? requestProperties.headersObject.token: false;
        tokenHandler._token.verify(token, phone,(tokenId)=>{
            if(tokenId){
                //lookup the user

                data.read('users',phone,(err,uData) => {
                    const userData= {...parseJSON(uData)};
                    if(!err&& userData){
                        if(firstName){
                            userData.firstName = firstName;
                        }
                        if(lastName){
                            userData.lastName = lastName;
                        }
                        if(password){
                            userData.password = hash(password);
                        }
                        //store to database
                        data.update('users',phone,userData,(err1)=>{
                            if(!err1){
                                callback(200,{
                                    "message":"user updated successfully"
                                })
    
                            }
                            else{
                                callback(500,{
                                    'error':'problem in server side'
                                });
                            }
                        })
    
                    }
                    else{
                        callback(400,{
                            'error':'problem in your request'
                        });
    
                    }
                })

            }
            else{
                callback(403,{
                    'error':'Authication failed',
                })
            }
        })
           

        }
        else{
            callback(400,{
                'error':'problem in your request'
            });
        }
    }
    else{
        callback(400,{
            'error':'Invalid phone number'
        });
    }
};

handler._users.delete = (requestProperties, callback) => {
    // Handle DELETE request
    const phone= typeof(requestProperties.queryStringObject.phone)==='string' && requestProperties.queryStringObject.phone.trim().length===11 ? requestProperties.queryStringObject.phone:false;
    if(phone){
        //lookup the user
        //verify token
        let token= typeof(requestProperties.headersObject.token)==='string' ? requestProperties.headersObject.token: false;
        tokenHandler._token.verify(token, phone,(tokenId)=>{
            if(tokenId){
                //lookup the user
                data.read('users',phone,(err,userData) => {
                    if(!err&& userData){
                        data.delete('users',phone,(err1)=>{
                            if(!err1){
                                callback(200,{
                                    'message':'succesfully deleted',
                                })
                            }
                            else{
                                callback(500,{
                                    'error':'Server Side problem',
                                });
        
                            }
                        });
        
        
                    }
                    else{
                        callback(500,{
                            'error':'Server Side problem',
                        });
                    }
                })
                

            }
            else{
                callback(403,{
                    'error':'Authication failed',
                })
            }
        })
        

    }
    else{
        callback(400,{
            'error':'Invalid phone number'
        });
    }

};

module.exports = handler;
