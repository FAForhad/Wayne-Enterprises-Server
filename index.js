const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const app = express()
const jwt = require('jsonwebtoken')
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c3txqlb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyjwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next()
    })
}


async function run() {
    try {
        const serviceCollection = client.db('wayneServices').collection('services');
        const reviewCollection = client.db('wayneServices').collection('rewiews')

        app.post('/jwt', (req, res) => {
            const user = req.body
            console.log(user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15d' })
            res.send({ token })
        })

        // Service Collection data 
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service)
            res.send(result)
        })

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query).sort({ time: -1 });
            const result = await cursor.limit(3).toArray()
            res.send(result)
        })
        app.get('/allservices', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query).sort({ time: -1 });
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            res.send(result)
        })


        // review Collection data
        app.get('/reviews', async (req, res) => {
            let review = {};
            if (req.query.serviceId) {
                review = {
                    serviceId: req.query.serviceId
                }
            }
            const cursor = reviewCollection.find(review).sort({ time: -1 });
            const result = await cursor.toArray()
            res.send(result);
        })


        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewCollection.insertOne(reviews)
            res.send(result)
        })

        app.get('/myreviews', verifyjwt, async (req, res) => {

            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: ' unsuthorized action' })
            }

            let quary = {};
            if (req.query.email) {
                quary = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(quary).sort({ time: -1 });
            const result = await cursor.toArray()
            res.send(result);
        })


        app.delete('/myreviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
        })


        // edit review
        app.put('/myreviews/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status
            console.log(status)
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    description: status
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc, options);
            res.send(result)

        })
    }
    finally {

    }
}

run().catch(error => console.log(error))

app.get('/', (req, res) => {
    res.send('Wanye server is running')
})



app.listen(port, () => {
    console.log(`app is running in port ${port}`)
})
