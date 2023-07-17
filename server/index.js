const net = require("net");
const mqttConnection = require("mqtt-connection");
const server = new net.Server();

const clients = new Map(); // Map to store connected clients

server.on("connection", function (stream) {
  var client = mqttConnection(stream);
  // Handle MQTT 'connect' event
  client.on("connect", function (packet) {
    // Store client information in the clients map
    clients.set(client.options.clientId, client);
    // Send 'connack' packet to acknowledge the client
    client.connack({ returnCode: 0 });
  });

  // Handle MQTT 'publish' event
  client.on("publish", function (packet) {
    // Publish the received message to subscribed clients

    clients.forEach((client) => {
      // Check if the client is subscribed to the message topic
      const isSubscribed = client.subscriptions.some(
        (subscription) => subscription.topic === packet.topic
      );

      if (isSubscribed) {
        client.publish(packet);
      }
    });
  });

  // Handle MQTT 'subscribe' event
  client.on("subscribe", function (packet) {
    // Store the subscription information for the client
    client.subscriptions = packet.subscriptions;
    client.suback({
      granted: packet.subscriptions.map(() => 0),
      messageId: packet.messageId,
    });
  });

  // Handle MQTT 'unsubscribe' event
  client.on("unsubscribe", function (packet) {
    // Remove the subscription for the client
    client.subscriptions = [];
    client.unsuback({ messageId: packet.messageId });
  });

  // Handle MQTT 'pingreq' event
  client.on("pingreq", function () {
    // Respond to the client with a 'pingresp' packet
    client.pingresp();
  });

  // Handle MQTT 'disconnect' event
  client.on("disconnect", function () {
    // Clean up client resources
    clients.delete(client.clientId);
    client.destroy();
  });

  // Handle stream timeout
  stream.on("timeout", function () {
    client.destroy();
  });

  // Handle stream error
  client.on("error", function () {
    client.destroy();
  });
});

// Start listening on port 1883
server.listen(1883, function () {
  console.log("MQTT broker listening on port 1883");
});
