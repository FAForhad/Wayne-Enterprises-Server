const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c3txqlb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const serviceCollection = client.db('wayneServices').collection('services');
        const reviewCollection = client.db('wayneServices').collection('rewiews')


        // Service Collection data 
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service)
            res.send(result)
        })

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const result = await cursor.limit(3).toArray()
            res.send(result)
        })
        app.get('/allservices', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
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
            const cursor = reviewCollection.find(review);
            const result = await cursor.toArray()
            res.send(result);
        })


        app.get('/myreviews', async (req, res) => {
            let quary = {};
            if (req.query.email) {
                quary = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(quary);
            const result = await cursor.toArray()
            res.send(result);
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
