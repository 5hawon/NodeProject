//dependencies

const data = require('../../lib/data');
const {hash} =require('../../helpers/utilities');
const {parseJSON} =require('../../helpers/utilities')
const {createRandomString} =require('../../helpers/utilities');

// Module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethod = ['put', 'post', 'get', 'delete'];
    if (acceptedMethod.indexOf(requestProperties.method) > -1) {
        // Check if `_users` is defined before accessing its properties
        if (handler._token && handler._token[requestProperties.method]) {
            handler._token[requestProperties.method](requestProperties, callback);
        } else {
            callback(405);
        }
    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
    // Handle POST request
    const phone= typeof(requestProperties.body.phone)==='string' && requestProperties.body.phone.trim().length===11 ? requestProperties.body.phone:false;

    const password= typeof(requestProperties.body.password)==='string' && requestProperties.body.password.trim().length>0 ? requestProperties.body.password:false;
    if(phone && password)
    {
        data.read('users', phone, (err, userData)=>{
            let hashedPassword =hash(password);
            if(hashedPassword===parseJSON(userData).password)
            {
                let tokenId= createRandomString(20);

                let expires = Date.now() + 60 * 60 * 1000;
                let tokenObject={
                    phone,
                    'id': tokenId,
                    expires 
                }


                //store the token object
                data.create('tokens', tokenId, tokenObject, (err1) =>{
                    console.log(err1)
                    if(!err1){
                        callback(200, tokenObject);

                    }
                    else{
                        callback(500,{
                            
                            'error':'Server Side problem',
                        });
                    }
                })

            }
            else{
                callback(400,{
                    'error':'Invalid password',
                });
            }
        })
    }
    else{
        callback(400,{
            'error':'you have a problem in your request',
        })
    }
    
};

handler._token.get = (requestProperties, callback) => {
    const id= typeof(requestProperties.queryStringObject.id)==='string' && requestProperties.queryStringObject.id.trim().length===20 ? requestProperties.queryStringObject.id:false;
    if(id){
        //lookup the token

        data.read('tokens',id,(err,tokenData) => {
            const token= {...parseJSON(tokenData)};
            if(!err && token)
            {
                callback(200,token);
            }
            else{
                callback(404,{
                    'error': 'requested token does not exist',
                });

            }
        })

    }
    else{
        callback(400,{
            'error': 'requested token does not exist',
        });
    }

    
};

handler._token.put = (requestProperties, callback) => {
    // Handle PUT request
    const id= typeof(requestProperties.body.id)==='string' && requestProperties.body.id.trim().length===20 ? requestProperties.body.id:false;
    const extend= typeof(requestProperties.body.extend)==='boolean' && requestProperties.body.extend===true ? true : false;
    console.log(extend);
    console.log(id);

    if(id && extend){
        data.read('tokens',id,(err, tokenData) =>{
            let tokenObject= parseJSON(tokenData);
            if(tokenObject.expires>Date.now()){
                tokenObject.expires = Date.now()*60*60*1000;

                // store the updated token
                data.update('tokens',id,tokenObject,(err1)=>{
                    if(!err1){
                        callback(200);

                    }
                    else{
                        callback(500,{
                            'error':'Server side error',
                        })
                    }

                })



            }
            else{
                callback(400,{
                    'error':'token already expired',
                })

            }

        })

    }
    else{
        callback(400,{
            'error':'there was a problem in your request',
        })
    }
    

   
};

handler._token.delete = (requestProperties, callback) => {
    // Handle DELETE request
    const id= typeof(requestProperties.queryStringObject.id)==='string' && requestProperties.queryStringObject.id.trim().length===20 ? requestProperties.queryStringObject.id:false;
    if(id){
        //lookup the user
        data.read('tokens',id,(err,tokenData) => {
            if(!err&& tokenData){
                data.delete('tokens',id,(err1)=>{
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
        callback(400,{
            'error':'Invalid phone number'
        });
    }
   

};

handler._token.verify =(id, phone, callback) =>{
    data.read('tokens',id,(err,tokenData)=>{
        if(!err && tokenData){
            if(parseJSON(tokenData).phone === phone&&parseJSON(tokenData).expires > Date.now()) {

                callback(true);


            }
            else{
                callback(false);
            }

        }
        else{
            callback(false);
        }
    })
}

module.exports = handler;
