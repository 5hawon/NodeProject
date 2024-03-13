//dependencies


//module scafolding
environment={};

environment.staging ={
    port: 3000,
    envName: 'staging',
    secretKey: 'hakafhakfhfakfh',
    maxChecks: 5,
    twilio :{
        fromPhone: '',
        accountSid: '',
        authToken:''  //use ur own auth token


    }

};

environment.production ={
    port: 5000,
    envName: 'production',
    secretKey: 'seiohwehowihg',
    twilio :{
        fromPhone: '',
        accountSid: '',
        authToken:'' //use ur own auth token



    }

};

//determin which env was passed

const currentEnvironment= typeof(process.env.NODE_ENV)=== 'string'? process.env.NODE_ENV : 'staging';

//export corresponding env object

const environmentToExport = typeof(environment[currentEnvironment])==='object'? environment[currentEnvironment]: environment.staging;

module.exports=environmentToExport;