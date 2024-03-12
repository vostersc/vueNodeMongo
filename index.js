const express = require('express');
const dbConnect = require('./db.js');
const app = express();

require('dotenv').config();

app.use(express.static('public'));
app.use(express.json());
app.use(dbConnect);

app.get('/', (r, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/customers/:customerId?', async (req, res) => {
    try {
        const collection = req.dbClient.db('database').collection('customers');

        if(!req.params.customerId){
            const allCustomers = await collection.find({}).toArray();
            console.log('index.js: 31 --->', allCustomers);
            res.json(allCustomers);
            return;
        }

        const result = await collection.findOne({ customerId: req.params.customerId });
        res.json(result);

    } catch(err){
        console.log('index.js: 41 --->', err);
        res.send('error');
    }

});


app.listen(process.env.SERVER_PORT, () => console.log(`Listening on ${process.env.SERVER_PORT}`));