/*
 * Title: Utilities
 * Description: Handle Various Kind of Utilities
 * Author: Mushfiq Mashuk
 * Date: 20-06-2021
 *
 */

// dependencies

const crypto = require('crypto');
// const { createHmac } = require('crypto'); // or we can just get the createHmac function by destructuring
const environment = require('./environments');

// utility scaffolding

const utilities = {};

utilities.parseJSON = (jsonString) => {
    let parsedData = {};
    try {
        parsedData = JSON.parse(jsonString);
    } catch (error) {
        parsedData = {};
        console.log(error);
    }
    return parsedData;
};

utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', environment.secretKey).update(str).digest('hex');
        return hash;
    }
    return false;
};

utilities.createRandomString = (size) => {
    let stringSize = typeof size === 'number' && size > 0 ? size : null;
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let output = '';
    while (stringSize) {
        output += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        stringSize--;
    }

    return output;
};

// export module

module.exports = utilities;
