const express = require('express');
const dbConnect = require('./db.js');
const app = express();
const bodyParser = require('body-parser');

require('dotenv').config();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(dbConnect);

app.get('/', (r, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/customers/:customerId?', async (req, res) => {
    try {
        const collection = req.dbClient.db('database').collection('customers');

        if(!req.params.customerId){
            const allCustomers = await collection.find({}).toArray();
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

app.delete('/customers/:customerId', async (req, res) => {
    try {
        if(!req.params.customerId) return res.status(422).json({error: 'Customer Id Required.'});

        const collection = req.dbClient.db('database').collection('customers');
        const result = await collection.deleteOne({ customerId: req.params.customerId });

        if (result.deletedCount === 1) {
            res.json({ message: "Customer deleted successfully" });
        } else {
            res.status(404).json({ error: "Customer not found" });
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/logs', async (req, res) => {
    try {
        const { locationId, startDate, endDate } = req.body;
        const hasAllValues = locationId && startDate && endDate;
        if (!hasAllValues) return res.status(422).json({ error: 'Location ID, start date, and end date are required.' });
        
        const pipeline = [
            {
                $lookup: {
                    from: "locations",
                    localField: "locationId",
                    foreignField: "locationId",
                    as: "location"
                }
            },
            { $match: { "location.locationId": locationId } },
            {
                $lookup: {
                    from: "customerLogs",
                    localField: "customerId",
                    foreignField: "customerId",
                    as: "logs"
                }
            },
            {
                $project: {
                    _id: 1,
                    customerData: "$$ROOT",
                    location: { $arrayElemAt: ["$location", 0] },
                    logs: {
                        $filter: {
                            input: "$logs",
                            as: "log",
                            cond: {
                                $and: [ { $gte: ["$$log.date", makeISO(startDate)] }, { $lte: ["$$log.date", makeISO(endDate)] } ]
                            }
                        }
                    }
                }
            }
        ];
        
        const customersCollection = req.dbClient.db('database').collection('customers');
        const allMatchingData = await customersCollection.aggregate(pipeline).toArray();
        const cleanData = allMatchingData.map(customer => {
            delete customer.location;
            delete customer.customerData.logs
            return customer;
        });

        res.send(cleanData);

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: "Internal server error" });
    }

    function makeISO(d){ return new Date(d).toISOString(); }
});

app.listen(process.env.SERVER_PORT, () => console.log(`Listening on ${process.env.SERVER_PORT}`));


// try both of the below requests to see date range working
    // POST TO: localhost:3001/logs
    // {
    //     "locationId": "1",
    //     "startDate": "2024-03-10T01:00:00.000+00:00",
    //     "endDate": "2040-03-09T09:00:00.000+00:00"
    // }

    // POST TO: localhost:3001/logs
    // {
    //     "locationId": "1",
    //     "startDate": "2024-03-11T01:00:00.000+00:00",
    //     "endDate": "2040-03-09T09:00:00.000+00:00"
    // }






//this request shows location filtering working
    // POST TO: localhost:3001/logs
    // {
    //     "locationId": "2",
    //     "startDate": "2020-03-10T01:00:00.000+00:00",
    //     "endDate": "2040-03-09T09:00:00.000+00:00"
    // }
