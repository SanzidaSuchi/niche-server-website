const express = require("express");
// const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;




const uri =` mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oyinl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const port = 5000;
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req,res) =>{
  res.send("Hello World");
});

client.connect(err => {
    client.connect();
    console.log("database connected successfully");
    const database = client.db('watchDb');
   
    /* All collection */
    const servicesCollection = database.collection('services');
    const ordersCollection = database.collection('orders');
    const reviewCollection = database.collection("review");
    const usersCollection = database.collection("users");

  

    // get watches api //
    app.get('/services', async (req, res) => {
        const cursor = servicesCollection.find({}).limit(6);
        const services = await cursor.toArray();
        res.send(services);
    });

        //post order data api //
      app.post('/orders', async(req, res) =>{
          const order = req.body;

          const result = await ordersCollection.insertOne(order);
          console.log(`A document was inserted with the _id: ${result.insertedId}`);
          res.json(result)
      });
    
           // get orders api //
      app.get('/orders', async (req, res) => {
        const cursor = ordersCollection.find({});
        const orders = await cursor.toArray();
        res.send(orders);
    });
    // confirmation put api 
    app.put("/confirmation/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = {
        $set: {
          status:"Confirm"
        },
      };
        const result = await ordersCollection.updateOne(query,order);
        res.json(result);
        console.log(result);
    });
     // review
  app.post("/addSReview", async (req, res) => {
    const result = await reviewCollection.insertOne(req.body);
    res.send(result);
  });
     // add services
  app.post("/services", async (req, res) => {
    console.log(req.body);
    const result = await servicesCollection.insertOne(req.body);
    console.log(result);
  });

   // delete data from cart delete api
   app.delete("/delete/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await ordersCollection.deleteOne(query);
    res.json(result);
  });

  app.post("/addUserInfo", async (req, res) => {
    console.log("req.body");
    const result = await usersCollection.insertOne(req.body);
    res.send(result);
    console.log(result);
  });
  //  make admin

  app.put("/makeAdmin", async (req, res) => {
    const filter = { email: req.body.email };
    const result = await usersCollection.find(filter).toArray();
    if (result) {
      const documents = await usersCollection.updateOne(filter, {
        $set: { role: "admin" },
      });
      console.log(documents);
    }
    
  });

  // check admin or not
  app.get("/checkAdmin/:email", async (req, res) => {
    const result = await usersCollection
      .find({ email: req.params.email })
      .toArray();
    console.log(result);
    res.send(result);
  });


 
  });


app.listen(process.env.PORT || port);
