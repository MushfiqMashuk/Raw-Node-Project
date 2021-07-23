/*
 * Title: Notifications File
 * Description: Send SMS with Twilio API to the user
 * Author: Mushfiq Mashuk
 * Date: 30/06/2021
 *
 */

// dependencies
const https = require('https');
const querystring = require('querystring');
const { twilio } = require('./environments');
// modeule scaffolding

const notifications = {};

// addind functionalities

notifications.sendTwilioSms = (userPhone, userMsg, callback) => {
    const phone =
        typeof userPhone === 'string' && userPhone.trim().length === 11 ? userPhone.trim() : null;
    const msg =
        typeof userMsg === 'string' && userMsg.trim().length > 0 && userMsg.trim().length <= 1600
            ? userMsg.trim()
            : null;
    console.log(phone);
    if (phone && msg) {
        // configure the request payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${phone}`,
            Body: userMsg,
        };
        // now we have to stringify the javascript object: payload. we are going to do it by a core node module querystring

        const stringifyPayload = querystring.stringify(payload); // encode means stringify

        // configure the request details

        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        const req = https.request(requestDetails, (res) => {
            const status = res.statusCode;
            console.log(`my status code ${status}`);
            if (status === 200 || status === 201 || status === 301) {
                callback(false);
            } else {
                callback('Status Code Not Matched!');
            }
        });

        req.on('error', (e) => {
            callback(e);
        });

        req.write(stringifyPayload);
        req.end();
    } else {
        callback('1 or 2 parameter is missing!');
    }
};

// exporting module

module.exports = notifications;
