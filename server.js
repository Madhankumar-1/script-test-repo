const express = require("express");
const axios = require("axios"); // For making HTTP requests
const app = express();
const port = 3000;

// In-memory data store
let items = [];

// Middleware to parse JSON bodies
app.use(express.json());

// Generate a unique instanceId based on the current time
const generateInstanceId = () => {
     return `inst-${Date.now()}`;
};

// Fetch the EC2 instance's private IP address
const getInstanceIpAddress = async () => {
     try {
          const response = await axios.get("http://169.254.169.254/latest/meta-data/local-ipv4", {timeout: 2000});
          return response.data;
     } catch (error) {
          console.error("Error fetching instance IP address:", error.message);
          return "unknown";
     }
};

// Default route
app.get("/", async (req, res) => {
     const machineId = await getInstanceIpAddress();
     const response = {
          instanceId: generateInstanceId(),
          machineId: machineId,
          type: "nodejs", // Default type
          deployment: "aws-ec2", // Default deployment
          pathParams: {}, // No path parameters
          queryParams: {}, // No query parameters
          method: req.method,
          path: req.path,
          startTime: new Date().toISOString(),
          message: "Hello World, Pathparam: none, Queryparam: none"
     };
     res.json(response);
});

// Route with path parameter
app.get("/:pathParam", async (req, res) => {
     const {pathParam} = req.params;
     const machineId = await getInstanceIpAddress();
     const response = {
          instanceId: generateInstanceId(),
          machineId: machineId,
          type: "nodejs", // Default type
          deployment: "aws-ec2", // Default deployment
          pathParams: req.params, // Path parameter
          queryParams: {}, // No query parameters
          method: req.method,
          path: req.path,
          startTime: new Date().toISOString(),
          message: `Hello World, Pathparam: ${pathParam}, Queryparam: none`
     };
     res.json(response);
});

// Route with path parameter and query parameter
app.get("/:pathParam/query", async (req, res) => {
     const {pathParam} = req.params;
     const {queryParam} = req.query;
     const machineId = await getInstanceIpAddress();
     const response = {
          instanceId: generateInstanceId(),
          machineId: machineId,
          type: "nodejs", // Default type
          deployment: "aws-ec2", // Default deployment
          pathParams: req.params, // Path parameter
          queryParams: req.query, // Query parameters
          method: req.method,
          path: req.path,
          startTime: new Date().toISOString(),
          message: `Hello World, Pathparam: ${pathParam}, Queryparam: ${queryParam || "none"}`
     };
     res.json(response);
});

// CRUD Operations

// Create (POST)
app.post("/items", (req, res) => {
     const newItem = req.body;
     items.push(newItem);
     res.status(201).json(newItem);
});

// Read (GET all items)
app.get("/items", (req, res) => {
     res.json(items);
});

// Read (GET single item by ID)
app.get("/items/:id", (req, res) => {
     const {id} = req.params;
     const item = items.find(i => i.id === parseInt(id));
     if (item) {
          res.json(item);
     } else {
          res.status(404).json({message: "Item not found"});
     }
});

// Update (PUT)
app.put("/items/:id", (req, res) => {
     const {id} = req.params;
     const updatedItem = req.body;
     const index = items.findIndex(i => i.id === parseInt(id));
     if (index !== -1) {
          items[index] = {...items[index], ...updatedItem};
          res.json(items[index]);
     } else {
          res.status(404).json({message: "Item not found"});
     }
});

// Delete (DELETE)
app.delete("/items/:id", (req, res) => {
     const {id} = req.params;
     const index = items.findIndex(i => i.id === parseInt(id));
     if (index !== -1) {
          items.splice(index, 1);
          res.status(204).send();
     } else {
          res.status(404).json({message: "Item not found"});
     }
});

// Start the server
app.listen(port, () => {
     console.log(`Server is running on http://localhost:${port}`);
});
