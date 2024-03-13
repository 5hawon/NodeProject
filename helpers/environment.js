//dependencies


//module scafolding
environment={};

environment.staging ={
    port: 3000,
    envName: 'staging',
    secretKey: 'hakafhakfhfakfh',
    maxChecks: 5,
    twilio :{
        fromPhone: '+16319934166',
        accountSid: 'ACf9cdb7ab2bfc9ffcc342bcb97681dcb5',
        authToken:'15b16171663af51b0549eac5bb427cf4'


    }

};

environment.production ={
    port: 5000,
    envName: 'production',
    secretKey: 'seiohwehowihg',
    twilio :{
        fromPhone: '+16319934166',
        accountSid: 'ACf9cdb7ab2bfc9ffcc342bcb97681dcb5',
        authToken:'15b16171663af51b0549eac5bb427cf4'



    }

};

//determin which env was passed

const currentEnvironment= typeof(process.env.NODE_ENV)=== 'string'? process.env.NODE_ENV : 'staging';

//export corresponding env object

const environmentToExport = typeof(environment[currentEnvironment])==='object'? environment[currentEnvironment]: environment.staging;

module.exports=environmentToExport;