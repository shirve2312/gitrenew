const mongoose = require("mongoose");
const logger = require("../helper/logger");

mongoose.set("debug", true);
mongoose.Promise = global.Promise;

const options = {
    autoIndex: true, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    //getting rid off the depreciation errors
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    user: 'planitnerd', // IMPORTANT TO HAVE IT HERE AND NOT IN CONNECTION STRING
    pass: 'oVvGUy3XgN4OTNY5', // IMPORTANT TO HAVE IT HERE AND NOT IN CONNECTION STRING
    dbName: process.env.DATABASE_ENV
};

mongoose.connect(process.env.MONGODB_ATLAS_CONNECTION_STRING, options).then(response => {
    console.log("+++ SUCCESS +++ Database server connected....");
}).catch(error => {
    console.log("['ERROR']! While Connecting To Database", error);
});

mongoose.connection.on("error", err => {
    logger.error(err);
});