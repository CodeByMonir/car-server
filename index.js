const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
dotenv.config();
const app = express();
app.use(cors());
const port = 4000;


const uri = process.env.MONGODB_CAR_SERVER;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const logger =  (req, res, next) => {
      console.log(req.params);
      next();
    }

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const db = client.db("RentACar");
    const carsCollection = db.collection("cars")

    app.get("/cars", async (req, res)=>{
      const cursor = carsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/cars/:carId", logger,  async (req, res) => {
        // const carId = req.params.carId;
        const { carId } = req.params;

        const query = { _id: new ObjectId(carId) };
        const result = await carsCollection.findOne(query);
        res.send(result);
      },
    );


    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Hello Boss");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
