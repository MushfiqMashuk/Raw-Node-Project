/*
 * Title: Tokens Handler
 * Description: Handle Tokens For Users
 * Author: Mushfiq Mashuk
 * Date: 27-06-2021
 *
 */

// Dependencies
const lib = require('../lib/data');
const { hash, parseJSON, createRandomString } = require('../helpers/utilities');

// app scaffolding
const handler = {};

// functionality

handler.tokenHandler = (requestProperties, callback) => {
    const methods = ['get', 'post', 'put', 'delete'];

    if (methods.indexOf(requestProperties.method) > -1) {
        handler.token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405); // If I don't want to allow any req method- 405 by convention
    }
};

// user object scaffolding
handler.token = {};

handler.token.post = (requestProperties, callback) => {
    const phone = typeof requestProperties.bodyData.phone === 'string' && requestProperties.bodyData.phone.trim().length === 11 && !isNaN(requestProperties.bodyData.phone.trim())
    ? requestProperties.bodyData.phone.trim() : null;

    const password = typeof requestProperties.bodyData.password === 'string' && requestProperties.bodyData.password.trim().length > 0 ? requestProperties.bodyData.password.trim() : null;

    if(phone && password){
        // lookup for the user

        lib.read('users', phone, (err, data)=>{
            if(!err && data){
                let hashedPassword = hash(password);

                if(parseJSON(data).password === hashedPassword){
                    const tokenId = createRandomString(20);
                    // token validity should be 1/2 hour
                    const expires = Date.now() + 600 * 60 * 1000; // 10 hour token validity

                    const tokenInfo = {
                        phone,
                        tokenId,
                        expires,
                    };

                    // store the token

                    lib.create('tokens', tokenId, tokenInfo, (err)=>{
                        if(!err){
                            callback(200, tokenInfo);
                        }else{
                            callback(500, {error: 'Server Error!'});
                        }
                    });

                }else{
                    callback(400, {error: 'Incorrect Password!'});
                }

            }else{
                callback(500, {error: 'Server Side Error!'});
            }
        });

    }else{
        callback(400, {error: 'There is a problem in your request!'});
    }

};

handler.token.get = (requestProperties, callback) => {
    const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id.trim() : null;
    
    // lookup the user with unique id number
    if(id){
        lib.read('tokens', id , (err, data)=>{
            const tokenInfo = parseJSON(data);
    
            if(!err && tokenInfo){
                callback(200, {tokenInfo});
            }else{
                callback(404, {error: 'Token Not Found!'});
            }
        });
    }else{
        callback(400, {error: 'There is a problem in your request!'});
    }
};

handler.token.put = (requestProperties, callback) => {
    const id = typeof requestProperties.bodyData.id === 'string' && requestProperties.bodyData.id.trim().length === 20 ? requestProperties.bodyData.id.trim() : null;

    const extend = typeof requestProperties.bodyData.extend === 'boolean' && requestProperties.bodyData.extend === true ? requestProperties.bodyData.extend : false;

    if(id && extend){
        // lookup for the token

        lib.read('tokens', id, (err, data)=>{
            if(!err && data){
                let tokenInfo = parseJSON(data);

                if(tokenInfo.expires > Date.now()){
                    tokenInfo.expires =  Date.now() + 600 * 60 * 1000;
                    lib.update('tokens', id, tokenInfo, (err)=>{
                        if(!err){
                            callback(200, {message: 'Token Updated Successfully!'});
                        }else{
                            callback(500, {error: 'Server Error!'});
                        }
                    });
                }else{
                    callback(500, {error: 'Token Already Expired!'});
                }

            }else{
                callback(500, {error: 'Server Side Error!'});
            }

        });

    }else{
        callback(400, {error: 'There is a problem in your request!'});
    }

};

handler.token.delete = (requestProperties, callback) => {
     // check the phone number if valid! 
    const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id.trim() : null;

    if(id){
        
        // lookup for the file! 

        lib.read('tokens', id, (err, data)=>{
            if(!err && data){
                lib.delete('tokens', id, (err)=>{
                    if(!err){
                        callback(200, {message: 'Token Deleted!'});
                    }else{
                        callback(500, {error: 'Error Deleting Token!'});
                    }
                });
            }else{  
                callback(500, {erro: 'Server Side Error!'});
            }
        });

    }else{
        callback(400, {error: 'There is a problem in your request!'});
    }
};

handler.token.verify = (id, phone, callback)=>{
    if (id && phone) {
        /// lookup for the token id

        lib.read('tokens', id, (err, data)=>{
            if(!err && data){
                const parsedData = parseJSON(data);
                if(parsedData.phone === phone && parsedData.expires > Date.now()){
                    callback(true);
                }else{
                    callback(false);
                }
            }else{
                callback(false);
            }
        });

    }else{
        callback(false);
    }
};

// exporting the object
module.exports = handler;
