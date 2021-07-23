/*
 * Title: Worker File
 * Description: Background workers to monitor checks
 * Author: Mushfiq Mashuk
 * Date: 15-06-2021
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
//const querystring = require('querystring'); // core module for json parsing
const lib = require('./data');
const { sendTwilioSms } = require('../helpers/notifications');
const { parseJSON } = require('../helpers/utilities');


// App object- module scaffolding
const worker = {};

worker.gatherAllChecks = () => {
    lib.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach((check) => {
                lib.read('checks', check, (err, checkData) => {
                    if (!err && checkData) {
                        // passing the check data to check validator
                        worker.validateChecks(parseJSON(checkData)); // decode() means parse()
                    } else {
                        console.log(`Error reading one of the check: ${err}`);
                    }
                });
            });
        } else {
            console.log(err);
        }
    });
};

worker.validateChecks = (checkDataObject) =>{
    const checkData = checkDataObject;
    if(checkDataObject && checkDataObject.checkId){
        checkData.state = typeof checkDataObject.state === 'string' && ['up', 'down'].indexOf(checkDataObject.state) > -1 ? checkDataObject.state : 'down';

        checkData.lastChecked = typeof checkDataObject.lastChecked === 'number' && checkDataObject.lastChecked > 0 ? checkDataObject.lastChecked : false; 

        // passing the data to the next process
        worker.performCheck(checkData);

    } else{
        console.log('Check was invalid!');
    }
};

worker.performCheck = (checkData) =>{

    let checkOutcome = {
        error: false,
        statusCode: false,
    };

    let outcomeSent = false;

    // parsing the host name and other materials to send requests
    const parsedUrl = url.parse(`${checkData.protocol}://${checkData.url}`, true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path;

    // construct the request

    const requestDetails = {
        protocol: `${checkData.protocol}:`,
        hostname: hostName,
        method: checkData.method.toUpperCase(),
        path,
        timeout: checkData.timeoutSeconds * 1000,
    };

    const protocolToUse = checkData.protocol === 'http' ? http : https;
    
    const req = protocolToUse.request(requestDetails, (res)=>{
        // grab the status code
        const status = res.statusCode;
        
        // update the check outcome and pass to the next process
        checkOutcome.statusCode = status;
        if(!outcomeSent){
            worker.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
        
    });

    req.on('error', (e)=>{
        // update the check outcome and pass to the next process
        checkOutcome = {
            error: true,
            value: e,
        }
        if(!outcomeSent){
            worker.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on('timeout', ()=>{
        // update the check outcome and pass to the next process
        checkOutcome = {
            error: true,
            value: 'timeout',
        }
        if(!outcomeSent){
            worker.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });

    // req send
    req.end();

};

worker.processCheckOutcome = (checkData, checkOutcome) =>{

    const state = !checkOutcome.error && checkOutcome.statusCode && checkData.successCodes.indexOf(checkOutcome.statusCode) > -1 ? 'up' : 'down'; 

    const alertWanted = checkData.lastChecked && checkData.state !== state ? true : false;
    console.log(alertWanted);
    // update the check data
    const updatedCheckData = checkData;
    updatedCheckData.state = state; 
    updatedCheckData.lastChecked = Date.now();

    // update the check data to database

    lib.update('checks', updatedCheckData.checkId, updatedCheckData, (err)=>{
        if(!err){
            // send the check data to next process
            if(alertWanted){
                worker.sendAlertToUser(updatedCheckData);
            } else{
                console.log('Alert Not Needed as There is no status change!');
            }
        }else{
            console.log('Error Updating File ' + err);
        }
    });

};

// a notification will be sent to the user if needed
worker.sendAlertToUser = (updatedCheckData) =>{
    const msg = `Alert: Your Check for ${updatedCheckData.method.toUpperCase()} ${updatedCheckData.protocol}://${updatedCheckData.url} is currently ${updatedCheckData.state}`;

    sendTwilioSms(updatedCheckData.phone, msg, (err)=>{
        if(!err){
            console.log('SMS sent Successfully! ' + msg);
        } else{
            console.log(`Error Sending SMS: ${err}`);
        }
    });

};

worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 8);
};

worker.init = () => {
    // gather all checks
    worker.gatherAllChecks();
    // loop the same process over and over
    worker.loop();
};

// export the server
module.exports = worker;
