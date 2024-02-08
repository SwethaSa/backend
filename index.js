import express from "express";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import cors from "cors";

const app = express();
dotenv.config();
app.use(cors());

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("Mongo is connected 🤩");

async function StartServer() {
  app.get("/", function (request, response) {
    response.send("🙋‍♂️, 🌏 🎊✨🤩");
  });

  //POST

  app.post("/products", express.json(), async function (request, response) {
    try {
      const data = request.body;
      console.log("Received data:", data);

      const result = await client
        .db("tintstore")
        .collection("products")
        .insertOne(data);
      response.send(result);
    } catch (error) {
      console.error("Error inserting document:", error);
      response.status(500).json({ error: "Error inserting document" });
    }
  });

  //GET

  app.get("/products/all", async function (request, response) {
    try {
      const result = await client
        .db("tintstore")
        .collection("products")
        .find({})
        .toArray();
      response.send(result);
    } catch (error) {
      console.error("Error Getting Data", error);
      response.status(404).json({ error: "Error Getting Documents" });
    }
  });

  app.get("/products/:idno", async function (request, response) {
    try {
      const { idno } = request.params;
      console.log(idno);

      const item = await client
        .db("tintstore")
        .collection("products")
        .findOne({ idno: idno });
      console.log(item);
      item
        ? response.send(item)
        : response.status(404).send({ message: "Item not Found" });
    } catch (error) {
      console.error("Error getting document:", error);
      response.status(404).json({ error: "Error retriving document" });
    }
  });

  // Example function to decrease instock quantity on order placement
  async function updateInventoryOnOrderPlacement(productId, quantity) {
    try {
      const result = await client
        .db("tintstore")
        .collection("products")
        .updateOne({ idno: productId }, { $inc: { instock: -quantity } });

      if (result.modifiedCount === 0) {
        throw new Error(
          "Failed to update inventory. Product not found or insufficient stock."
        );
      }

      console.log(`Inventory updated successfully for product ${productId}`);
    } catch (error) {
      console.error("Error updating inventory:", error);
      throw error;
    }
  }

  app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
}
StartServer();

export { client };
