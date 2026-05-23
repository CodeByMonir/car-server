const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
dotenv.config();
const app = express();
app.use(cors());
const port = process.env.PORT || 4000;
const uri = process.env.MONGODB_CAR_SERVER;


const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const logger =  (req, res, next) => {

      next();
    }

const verifyJWT = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send("Authorization header is missing");
  }

  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send("Token is missing");
  }

  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
    )
    const { payload } = await jwtVerify(token, JWKS)
    req.user = payload;

    
  } catch (error) {
    console.error('Token validation failed:', error)
    throw error
  }
  next();
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const db = client.db("RentACar");
    const carsCollection = db.collection("cars");

    app.get("/cars", async (req, res) => {
      const cursor = carsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/cars/:carId", logger, verifyJWT, async (req, res) => {
      // const carId = req.params.carId;
      const { carId } = req.params;

      const query = { _id: new ObjectId(carId) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });

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
