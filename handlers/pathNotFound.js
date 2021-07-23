/*
 * Title: Path Not Found Handler
 * Description: 404 not found handler
 * Author: Mushfiq Mashuk
 * Date: 17-06-2021
 *
 */

// app scaffolding
const handler = {};

// functionality

handler.pathNotFoundHandler = (requestProperties, callback) => {
    // here will be my work, using request properties
    // Then I just have to use the callback function to send my data/payload to ReqRes page.
    callback(404, {
        message: '404 Not Found!',
    });
};

// exporting the object
module.exports = handler;
