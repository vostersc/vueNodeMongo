require('dotenv').config();
const { MongoClient } = require('mongodb');

const db = new MongoClient(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })

const dbConnect = (req, r, next) => {
    req.dbClient = db;
    next();
};

(async function connectToMongoDB() {
    try {
        await db.connect();
        console.log('Connected to Mongo');
    } catch (err) {
        console.error('Error connecting to Mongo: ', err);
    }
})();

module.exports = dbConnect;