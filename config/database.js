const mongoose = require("mongoose");

exports.connectDB = async () => {
    await mongoose
        .connect(process.env.MONGODB_URI)
        .then(() => {
            console.log(`Database Connected successfully`);
        })
        .catch((error) => {
            console.log(`MONGODB CONNECTION FAILED: ${error}`);
            console.log(`ERROR MESSAGE: ${error.message}`);
        });
};
