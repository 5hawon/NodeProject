
const crypto =require('crypto');
const enviroment =require('./environment');
//module scafolding
const utilities ={};

//parse json string to object
utilities.parseJSON = (jsonString)=>{
    let output ={};

    try{
        output= JSON.parse(jsonString)
    } catch{
        output={};
    }

    return output;

}

//hash the password
utilities.hash = (str)=>{
    
    if(typeof(str)==='string'&& str.length>0)
    {
        const hash = crypto
                .createHmac('sha256', enviroment.secretKey)
               .update(str)
               .digest('hex');
               return hash;
    }
    else{
        return false;
    }

}
utilities.createRandomString = (strlength)=>{
    let length= strlength;
    length =typeof(strlength)==='number' && strlength>0 ? strlength:false;
    if(length){
        let pssiblecharacters ='abcdefghijklmnopqrstuvwxyz0123456789';
        let output='';
        for(let i=0; i<length; i+=1){
            const randomcharacter=pssiblecharacters.charAt(Math.floor(Math.random()*pssiblecharacters.length));
            output+=randomcharacter;

        }
        return output;
    }
    else{
        return false;

    }


   
    
    

}

//export module
module.exports=utilities;