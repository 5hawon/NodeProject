//module scafoldings
handler ={};

handler.notfoundHandler = (requestProperties, callback)=>{
   
    callback(404,{
        message: '  url not found',
    })

};
module.exports = handler;