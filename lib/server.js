/*
 * Title: Server File
 * Description: This is the seperate file for server creation
 * Author: Mushfiq Mashuk
 * Date: 01-07-2021
 *
 */

// Dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environments');

// const data = require('./lib/data');

// App object- module scaffolding
const server = {};

// Test Twilio sms function

/* sendTwilioSms('01521423626', 'I was shocked!', (err)=>{
    console.log(err);
});
*/
// Testing new file creation @ToDo: pore muchhe dibo
// data.create('test', 'testFile', { name: 'Mashuk', Country: 'Bangladesh' }, (err) => {
//     console.log(err);
// });

// Testing file reading

// data.read('test', 'testFile', (result) => {
//     console.log(result);
// });

// Testing file update

// data.update('test', 'testFile', { name: 'Thanos', home: 'Titan' }, (err) => {
//     console.log(err);
// });

/// Testing file delete

// data.delete('test', 'testFile', (err) => {
//     console.log(err);
// });

// create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(environment.port, () => {
        console.log(`Environement Variable: ${process.env.NODE_ENV}`);
        console.log(`Listening to port: ${environment.port}`);
    });
};

server.handleReqRes = handleReqRes;

server.init = () => {
    server.createServer();
};

// export the server
module.exports = server;
