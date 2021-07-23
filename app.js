/*
 * Title: Raw Node API project
 * Description: We are going to build an API (Uptime monitoring)
 * Author: Mushfiq Mashuk
 * Date: 15-06-2021
 *
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/worker');

// const data = require('./lib/data');

// App object- module scaffolding
const app = {};

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
app.init = () => {
    // initialize the server
    server.init();

    // intialize the workers

    workers.init();
};

app.init();

// export module
module.exports = app;
