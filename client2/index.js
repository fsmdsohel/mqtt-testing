const express = require("express");
const app = express();
const port = 5001;

const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost:1883"); // Replace with your broker's address

client.on("connect", () => {
  console.log("Connected to MQTT broker");

  // Subscribe to a topic
  client.subscribe("myTopic", (err) => {
    if (err) {
      console.error("Error subscribing to topic:", err);
    } else {
      console.log("Subscribed to topic: myTopic");
    }
  });

  // Publish a message to a topic
  // client.publish("myTopic", "Hello MQTT!");
});

client.on("message", (topic, message) => {
  console.log("Received message:", message.toString(), "on topic:", topic);
  // Add your custom logic for handling received messages here
});

client.on("close", () => {
  console.log("Connection closed");
  // Add your custom logic for handling connection close here
});

app.get("/", (req, res) => {
  res.send("mqtt client running on this port");
});

app.get("/hello", (req, res) => {
  client.publish("myTopic", "Hello MQTT!");
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
