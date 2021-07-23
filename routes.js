/*
 * Title: Routers
 * Description: App router
 * Author: Mushfiq Mashuk
 * Date: 17-06-2021
 *
 */

// dependencies
const { userHandler } = require('./handlers/userHandler');
const { tokenHandler } = require('./handlers/tokenHandler');
const { checkHandler } = require('./handlers/checkHandler');

// app scaffolding
const routes = {
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
};

// exporting routes object
module.exports = routes;
