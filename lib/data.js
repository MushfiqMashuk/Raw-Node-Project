/*
 * Title: Data File
 * Description: This is the data handling file.
 * Author: Mushfiq Mashuk
 * Date: 18-06-2021
 *
 */

// Dependencies
const fs = require('fs');
const path = require('path');

// module scaffolding

const lib = {};

lib.baseDir = path.join(__dirname, '../.data/');

// adding functionality
// create new file
lib.create = (dir, file, data, callback) => {
    if (typeof dir === 'string') {
        fs.open(`${lib.baseDir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                // convert data to string
                const stringData = JSON.stringify(data); // converts the plain text in JSON format

                // write data to file
                fs.writeFile(fileDescriptor, stringData, (err) => {
                    if (!err) {
                        fs.close(fileDescriptor, (err) => {
                            if (!err) {
                                callback(false);
                            } else {
                                callback('Error Closing the new file!');
                            }
                        });
                    } else {
                        callback('Error writing to file!');
                    }
                });
            } else {
                callback(err);
            }
        });
    } else {
        callback('Please Pass The Correct Directory Name!');
    }
};
// read from the file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir + dir}/${file}.json`, 'UTF-8', (err, data) => {
        if (!err && data) {
            callback(false, data);
        } else {
            callback(err, `Error Reading File! ${err}`);
        }
        //callback(err, data);
    });
};
// update the file
lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.baseDir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            fs.ftruncate(fileDescriptor, (err) => {
                // or I can use fs.truncate(`${lib.baseDir + dir}/${file}.json`, (err)=>{})
                if (!err) {
                    const stringData = JSON.stringify(data);

                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error Closing The File!');
                                }
                            });
                        } else {
                            callback('Error Writing File!');
                        }
                    });
                } else {
                    callback('Error Truncating the file!');
                }
            });
        } else {
            callback('Error Updating File!');
        }
    });
};
// delete file
lib.delete = (dir, file, callback) => {
    fs.unlink(`${lib.baseDir + dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error Deleting File!');
        }
    });
};
// list all the items in a given directory
lib.list = (dir, callback) => {
    fs.readdir(`${lib.baseDir + dir}/`, (err, files) => {
        if (!err && files && files.length > 0) {
            const fileNames = [];
            files.forEach((file) => {
                fileNames.push(file.replace('.json', ''));
            });
            callback(false, fileNames);
        } else {
            callback('Error reading directory! Maybe The Directory is Empty!');
        }
    });
};

// export
module.exports = lib;
