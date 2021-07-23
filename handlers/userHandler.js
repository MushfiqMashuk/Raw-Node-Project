/*
 * Title: Users Handler
 * Description: Handle all the users
 * Author: Mushfiq Mashuk
 * Date: 17-06-2021
 *
 */

// Dependencies
const lib = require('../lib/data');
const { hash } = require('../helpers/utilities');
const { parseJSON } = require('../helpers/utilities');
const tokenHandler = require('./tokenHandler');


// app scaffolding
const handler = {};

// functionality

handler.userHandler = (requestProperties, callback) => {
    const methods = ['get', 'post', 'put', 'delete'];

    if (methods.indexOf(requestProperties.method) > -1) {
        handler.user[requestProperties.method](requestProperties, callback);
    } else {
        callback(405); // If I don't want to allow any req method- 405 by convention
    }
};

// user object scaffolding
handler.user = {};

handler.user.post = (requestProperties, callback) => {
    const firstName =
        typeof requestProperties.bodyData.firstName === 'string' && requestProperties.bodyData.firstName.trim().length > 0
            ? requestProperties.bodyData.firstName.trim()
            : null;

    const lastName =
        typeof requestProperties.bodyData.lastName === 'string' &&
        requestProperties.bodyData.lastName.trim().length > 0
        ? requestProperties.bodyData.lastName.trim()
        : null;

    const phone = typeof requestProperties.bodyData.phone === 'string' && requestProperties.bodyData.phone.trim().length === 11 && !isNaN(requestProperties.bodyData.phone.trim())
        ? requestProperties.bodyData.phone.trim()
        : null;

    const password = typeof requestProperties.bodyData.password === 'string' && requestProperties.bodyData.password.trim().length > 0
        ? requestProperties.bodyData.password.trim()
        : null;
    const tosAgreement = typeof requestProperties.bodyData.tosAgreement === 'boolean'
        ? requestProperties.bodyData.tosAgreement : null;

    if(firstName && lastName && phone && password && tosAgreement){
        lib.read('users', phone, (err)=>{
            if(err){
                const userData = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                
                lib.create('users', phone, userData, (err)=>{
                    
                    if(!err){
                        callback(200, {message:'User Created Successfully!'});
                    }else{
                        callback(500, {error: 'Error Creating User!'});
                    }
                });
                
            }else{
                callback(500, { // for internel server error
                    error: 'There is an error in server side!'
                });
            }
        });
    }else{
        callback(400, {error: 'There is a Problem with your request!'}); // 400 by convention for request problem
    }

};
handler.user.get = (requestProperties, callback) => {
    const phone = typeof requestProperties.queryStringObject.phone === 'string' && requestProperties.queryStringObject.phone.trim().length === 11 && !isNaN(requestProperties.queryStringObject.phone.trim()) ? requestProperties.queryStringObject.phone.trim() : null;
    
    if(phone){
        // verify the token id /// Authentication check
        const token = typeof requestProperties.requestHeader.token === 'string' && requestProperties.requestHeader.token.trim().length > 0 ? requestProperties.requestHeader.token.trim() : null;

        if(token){
            tokenHandler.token.verify(token, phone, (tokenId)=>{
                if(tokenId){
                // lookup the user with unique id phone number
                lib.read('users', phone, (err, user)=>{
                const userInfo = parseJSON(user);
                delete userInfo.password;

                if(!err && userInfo){
                    callback(200, {userInfo});
                }else{
                    callback(404, {error: 'User Not Found!'});
                }
                });
            }else{
                callback(403, {error: 'Authentication Failure!'});
            }
    });
        }else{
            callback(400, {error: 'Invalid Token Id!'});
        }
       
    }else{
        callback(400, {error: 'Invalid Phone Number!'});
    }

};
handler.user.put = (requestProperties, callback) => {
    const phone = typeof requestProperties.bodyData.phone === 'string' && requestProperties.bodyData.phone.trim().length === 11 ? requestProperties.bodyData.phone.trim() : null;

    const firstName =
        typeof requestProperties.bodyData.firstName === 'string' && requestProperties.bodyData.firstName.trim().length > 0
            ? requestProperties.bodyData.firstName.trim()
            : null;

    const lastName = typeof requestProperties.bodyData.lastName === 'string' && requestProperties.bodyData.lastName.trim().length > 0
        ? requestProperties.bodyData.lastName.trim()
        : null;

    const password = typeof requestProperties.bodyData.password === 'string' && requestProperties.bodyData.password.trim().length > 0
        ? requestProperties.bodyData.password.trim()
        : null;

    if(phone){

        if(firstName || lastName || password){

            
            // verify the token id /// Authentication check
            const token = typeof requestProperties.requestHeader.token === 'string' && requestProperties.requestHeader.token.trim().length > 0 ? requestProperties.requestHeader.token.trim() : null;

            if(token){
                tokenHandler.token.verify(token, phone, (tokenId)=>{
                    if(tokenId){
                        // lookup the user
                          lib.read('users', phone, (err, data)=>{
                if(!err && data){
                    const userData = parseJSON(data);
                    if(firstName){
                        userData.firstName = firstName;
                    }
                    
                    if(lastName){
                        userData.lastName = lastName;
                    }
                    
                    if(password){
                        userData.password = hash(password);
                    }

                    lib.update('users', phone, userData, (err)=>{
                        if(!err){
                            callback(200, {message: 'User Updated Successfully!'});
                        }
                        else{
                            callback(500, {error: 'Internel Server Error!'});
                        }
                    });

                }else{  
                    callback(500, {error: 'Server Error!'});
                }
            });
                    }else{
                        callback(403, {error: 'Authentication Failure!'});
                    }
                });
            }else{
                callback(400, {error: 'Invalid Token Id!'});
            }
          
        }else{
            callback(400, {error: 'There is a problem in your request!'});
        }
    }else{
        callback(400, {error: 'Invalid Phone Number! Please Try Again!'});
    }
};
handler.user.delete = (requestProperties, callback) => {
    // check the phone number if valid! 
    const phone = typeof requestProperties.queryStringObject.phone === 'string' && requestProperties.queryStringObject.phone.trim().length === 11 && !isNaN(requestProperties.queryStringObject.phone.trim()) ? requestProperties.queryStringObject.phone.trim() : null;

    if(phone){
        
        const token = typeof requestProperties.requestHeader.token === 'string' && requestProperties.requestHeader.token.trim().length > 0 ? requestProperties.requestHeader.token.trim() : null;
        
        if(token){
            tokenHandler.token.verify(token, phone, (tokenId)=>{
                if(tokenId){
                    // lookup for the file! 

                    lib.read('users', phone, (err, data)=>{
                        if(!err && data){
                            lib.delete('users', phone, (err)=>{
                                if(!err){
                                    callback(200, {message: 'File Deleted!'});
                                }else{
                                    callback(500, {error: 'Error Deleting File!'});
                                }
                            });
                        }else{  
                            callback(500, {erro: 'Server Side Error!'});
                        }
                    });
                    
                }else{
                    callback(400, {error: 'Invalid Token Id!'});
                }
            });
        }else{
            callback(400, {error: 'Invalid Token Id!'});
        }

    }else{
        callback(400, {error: 'There is a problem in your request!'});
    }

};

// exporting the object
module.exports = handler;
