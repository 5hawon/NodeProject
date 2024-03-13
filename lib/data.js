//dependencies

const fs=require('fs');
const path= require('path');

const lib ={};

//base directiory of data folder 

lib.basedir = path.join(__dirname, '../.data/');

//write data file
lib.create =(dir, file, data, callback)=>{
    //open file for file
    fs.open(lib.basedir+dir+'/'+file+'json', 'wx', (err, fileDescriptor)=>{
        if(!err && fileDescriptor){
            // convert data to strinf
            const stringData = JSON.stringify(data);

            //write data to file and close it
            fs.writeFile(fileDescriptor, stringData, (err1)=>{
                if(!err1)
                {
                    fs.close(fileDescriptor, (err2)=>{
                        if(!err2)
                        {
                            callback(false);

                        }
                        else
                        {
                            callback('error closing the new file');
                        }
                    })

                }
                else
                {
                    callback('error writing to new file');
                }
            })

        }
        else
        {
            callback(err);
        }
    });



}

//read data from file
lib.read=(dir, file, callback)=>{
    fs.readFile(lib.basedir+dir+'/'+file+'json','utf-8', (err, data)=>{
        callback(err, data);
    })
}

//update existing file
lib.update= (dir, file,data, callback) =>{
    //fle open for writing
    fs.open(lib.basedir+dir+'/'+file+'json','r+', (err, fileDescriptor)=>{
        if(!err && fileDescriptor)
        {
            const stringData =JSON.stringify(data);

            //truncate the file
            fs.ftruncate(fileDescriptor, (err1)=>{
                if(!err1)
                {
                    //write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err2)=>{
                        if(!err2)
                        {
                            //close the file
                            fs.close(fileDescriptor,(err3)=>{
                                if(!err3)
                                {
                                    callback(false);
                                }
                                else
                                {
                                    callback('error closing file');
                                }
                            })

                        }
                        else
                        {
                            callback('error writing file');
                        }
                    })

                }
                else
                {
                    console.log('error truncatating file');
                }
            })
        }
        else
        {
            console.log('error updating')
        }
    })
}

//delete existing file
lib.delete= (dir, file, callback) =>{
    //unlink file
    fs.unlink(lib.basedir+dir+'/'+file+'json',(err)=>{
        if(!err)
        {
            callback(false);

        }
        else
        {
            callback('error deleting the file');

        }
    })
}

//list all items in the directory
lib.list=(dir, callback)=>{
    fs.readdir(lib.basedir+dir+'/', (err, filenames)=>{
        if(!err && filenames && filenames.length>0){
            let trimmedFileNames=[];
            filenames.forEach(fileName =>{
                trimmedFileNames.push(fileName.replace('.json','')); 
            })
            callback(false, trimmedFileNames);

        }
        else{
            callback('Error Reading Directory');
        }
    })

}

module.exports=lib;