/*
 * Title: Check Handler
 * Description: Handle checks For Users
 * Author: Mushfiq Mashuk
 * Date: 29-06-2021
 *
 */

// Dependencies
const lib = require('../lib/data');
const { hash, parseJSON, createRandomString } = require('../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../helpers/environments');

// app scaffolding
const handler = {};

// functionality

handler.checkHandler = (requestProperties, callback) => {
    const methods = ['get', 'post', 'put', 'delete'];

    if (methods.indexOf(requestProperties.method) > -1) {
        handler.check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405); // If I don't want to allow any req method- 405 by convention
    }
};

// user object scaffocheck
handler.check = {};

handler.check.post = (requestProperties, callback) => {
    const protocol =        typeof requestProperties.bodyData.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.bodyData.protocol.trim()) > -1
            ? requestProperties.bodyData.protocol.trim()
            : null;
    const url = typeof requestProperties.bodyData.url === 'string' && requestProperties.bodyData.url.trim().length > 0 ? requestProperties.bodyData.url.trim() : null;

    const method = typeof requestProperties.bodyData.method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.bodyData.method.trim()) > -1 ? requestProperties.bodyData.method.trim() : null;

    const successCodes = typeof requestProperties.bodyData.successCodes === 'object' && requestProperties.bodyData.successCodes instanceof Array ? requestProperties.bodyData.successCodes : null;

    const timeoutSeconds = typeof requestProperties.bodyData.timeoutSeconds === 'number' && requestProperties.bodyData.timeoutSeconds % 1 === 0 && requestProperties.bodyData.timeoutSeconds >= 1 && requestProperties.bodyData.timeoutSeconds <= 5 ? requestProperties.bodyData.timeoutSeconds : false;


    if (protocol && url && method && successCodes && timeoutSeconds) {
        // verify the token id /// Authentication check
        const token = typeof requestProperties.requestHeader.token === 'string' &&requestProperties.requestHeader.token.trim().length > 0 ? requestProperties.requestHeader.token.trim() : null;

        if(token){
            //lookup for the token info to get the user's phone

            lib.read('tokens', token, (err, tokenData)=>{

                if(!err && tokenData){
                    const phone = parseJSON(tokenData).phone;
                    
                    // checking if the user exists
                    lib.read('users', phone, (err, userData)=>{
                        if(!err && userData){
                            tokenHandler.token.verify(token, phone, (tokenIsValid)=>{
                                if(tokenIsValid){
                                    const userObject = parseJSON(userData);
                                    const checkArray = typeof userObject.checks === 'object' && userObject.checks instanceof Array ? userObject.checks : [];
                                    if(checkArray.length < maxChecks){
                                        const checkId = createRandomString(20);
                                        const checkObject = {
                                            checkId,
                                            phone,
                                            protocol,
                                            url,
                                            successCodes,
                                            method,
                                            timeoutSeconds,
                                        }

                                        // save the check object to database

                                        lib.create('checks', checkId, checkObject, (err)=>{
                                            if(!err){
                                                // now save a log of checkid's into user info
                                                userObject.checks = checkArray;
                                                userObject.checks.push(checkId);

                                                lib.update('users', phone, userObject, (err)=>{
                                                    if(!err){
                                                        callback(200, userObject);
                                                    }else{
                                                        callback(500, {error: 'Server Side Error4!'});
                                                    }
                                                });
                                            }else{
                                                callback(500, {error: 'Server Side Error3!'});
                                            }
                                        });

                                    }else{
                                        callback(401, {error: 'Maximum Checks limit reached!'})
                                    }

                                }else{
                                    callback(403, {error: 'Authentication Failure!'});
                                }
                            });
                        }else{
                            callback(500, {error: 'Server Side Error2!'});
                        }
                    });
                }else{
                    callback(500, {error: 'Server Side Error1!'});
                }

            });

        }else{
            callback(403, {error: 'Invalid Token!'});
        }

    } else {
        callback(400, {error: 'There is problem in your request!'});
    }

 };

handler.check.get = (requestProperties, callback) => {
    const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id.trim() : null;

    // lookup for the check 
    
    if(id){
        lib.read('checks', id, (err, checkData)=>{
            if(!err && checkData){
                const token = typeof requestProperties.requestHeader.token === 'string' && requestProperties.requestHeader.token.trim().length > 0 ? requestProperties.requestHeader.token.trim() : null;

                const checkObject = parseJSON(checkData);
                const phone = checkObject.phone;

                if(token){
                    tokenHandler.token.verify(token, phone, (tokenIsValid)=>{
                        if(tokenIsValid){
                            callback(200, checkObject);
                        } else{
                            callback(403, {error: 'Authentication Failure!'}); 
                        }
                    });
                }else{
                    callback(400, {error: 'Problem in your request!'});
                }

            } else{
                callback(500, {error: 'Server Side Error!'});
            }
        });
    } else {
        callback(400, {error: 'Problem in your request!'});
    }
    
};

handler.check.put = (requestProperties, callback) => {
    const id = typeof requestProperties.bodyData.id === 'string' && requestProperties.bodyData.id.trim().length === 20 ? requestProperties.bodyData.id.trim() : null;

    const protocol =        typeof requestProperties.bodyData.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.bodyData.protocol.trim()) > -1
            ? requestProperties.bodyData.protocol.trim()
            : null;
    const url = typeof requestProperties.bodyData.url === 'string' && requestProperties.bodyData.url.trim().length > 0 ? requestProperties.bodyData.url.trim() : null;

    const method = typeof requestProperties.bodyData.method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.bodyData.method.trim()) > -1 ? requestProperties.bodyData.method.trim() : null;

    const successCodes = typeof requestProperties.bodyData.successCodes === 'object' && requestProperties.bodyData.successCodes instanceof Array ? requestProperties.bodyData.successCodes : null;

    const timeoutSeconds = typeof requestProperties.bodyData.timeoutSeconds === 'number' && requestProperties.bodyData.timeoutSeconds % 1 === 0 && requestProperties.bodyData.timeoutSeconds >= 1 && requestProperties.bodyData.timeoutSeconds <= 5 ? requestProperties.bodyData.timeoutSeconds : false;

    if(id){
        if (protocol || url || method || successCodes || timeoutSeconds) {
            // lookup for the check info to get the phone
            lib.read('checks', id, (err, checkData)=>{
                if(!err && checkData){
                    const checkObject = parseJSON(checkData);
                    // here we get the phone, now we can authenticate the token.
                    const phone = checkObject.phone;
                    const token = typeof requestProperties.requestHeader.token === 'string' &&requestProperties.requestHeader.token.trim().length > 0 ? requestProperties.requestHeader.token.trim() : null;

                    if(token){
                        tokenHandler.token.verify(token, phone, (tokenIsValid)=>{
                            if(tokenIsValid){
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
                                if(timeoutSeconds){
                                    checkObject.timeoutSeconds = timeoutSeconds;   
                                }

                                lib.update('checks', id, checkObject, (err)=>{
                                    if(!err){
                                        callback(200, checkObject);
                                    } else{
                                        callback(500, {error: 'Server Error!'});
                                    }
                                });

                            } else{
                                callback(403, {error: 'Authentication Failure!'});
                            }
                        });

                    } else{
                        callback(400, {error: 'Invalid Token!'});
                    }

                } else{
                    callback(500, {error: 'Server Error!'});
                }
            });
        } else {
            callback(400, {error: 'There is problem in your request!'});
        }
    } else{
        callback(400, {error: 'Invalid Check ID!'});
    }

};

handler.check.delete = (requestProperties, callback) => {
    const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id.trim() : null;

    // lookup for the check 
    
    if(id){
        lib.read('checks', id, (err, checkData)=>{
            if(!err && checkData){
                const token = typeof requestProperties.requestHeader.token === 'string' && requestProperties.requestHeader.token.trim().length > 0 ? requestProperties.requestHeader.token.trim() : null;

                const checkObject = parseJSON(checkData);
                const phone = checkObject.phone;

                if(token){
                    tokenHandler.token.verify(token, phone, (tokenIsValid)=>{
                        if(tokenIsValid){
                            lib.delete('checks', id, (err)=>{
                                if(!err){
                                    lib.read('users', phone, (err, userData)=>{
                                        if(!err && userData){
                                            const userObject = parseJSON(userData);
                                            const checks = typeof userObject.checks === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                            const positionToBeDeleted = checks.indexOf(id);

                                            if(positionToBeDeleted > -1){
                                                checks.splice(positionToBeDeleted, 1);
                                                userObject.checks = checks;

                                                lib.update('users', phone, userObject, (err)=>{
                                                    if(!err){
                                                        callback(200, userObject);
                                                    }else{
                                                        callback(500, {error: 'File Cannot be Updated!'})
                                                    }
                                                });
                                            } else{
                                                callback(400, {error: 'The check id does not exists in the database!'});
                                            }
                                        }else{
                                            callback(500, {error: 'Server Side Error3!' + err});
                                        }
                                    });
                                } else{
                                    callback(500, {error: 'Server Side Error2!' + err});
                                }
                            });
                        } else{
                            callback(403, {error: 'Authentication Failure!'}); 
                        }
                    });
                }else{
                    callback(400, {error: 'Problem in your request!'});
                }

            } else{
                callback(500, {error: 'Server Side Error1!' + err});
            }
        });
    } else {
        callback(400, {error: 'Problem in your request!'});
    }
};

// exporting the object
module.exports = handler;
