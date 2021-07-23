/*
 * Title: Environments File
 * Description: Handle all the environments
 * Author: Mushfiq Mashuk
 * Date: 18-06-2021
 *
 */

// Dependencies

// Module scaffolding

const environments = {};

// Adding environments
environments.staging = {
    port: 3000,
    env: 'staging',
    secretKey: 'bnv$s#herKYGt@df5dJDdklfjcxiuyerew$#90374',
    maxChecks: 5,
    twilio: {
        fromPhone: '+19419093390',
        accountSid: 'AC2953a8a4abc7a4d396ec5a5dcc14f1e7',
        authToken: '77c903ff27b0e512088794158c6939e0',
    },
};
environments.production = {
    port: 5000,
    env: 'production',
    secretKey: 'bnv&*^HGhdf$dkfuiw%$$jgF%g%gsrew$#84Bhg',
    maxChecks: 5,
    twilio: {
        fromPhone: '+19419093390',
        accountSid: 'AC2953a8a4abc7a4d396ec5a5dcc14f1e7',
        authToken: '77c903ff27b0e512088794158c6939e0',
    },
};

// selecting environment given by the programmer through Terminal
const env = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';
const selectedEnvironment =    typeof environments[env] === 'object' ? environments[env] : environments.staging;

// export the selected environment
module.exports = selectedEnvironment;
