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

// // Fetch the EC2 instance's private IP address
// const getInstanceIpAddress = async () => {
//      try {
//           const response = await axios.get("http://169.254.169.254/latest/meta-data/local-ipv4", {timeout: 2000});
//           return response.data;
//      } catch (error) {
//           console.error("Error fetching instance IP address:", error.message);
//           return "unknown";
//      }
// };

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
     const {message} = req.query;
     const machineId = await getInstanceIpAddress();
     const response = {
          instanceId: generateInstanceId(),
          machineId: machineId,
          type: "nodejs", // Default type
          deployment: "aws-ec2", // Default deployment
          pathParams: req.params, // Path parameter
          queryParams: req.query, // No query parameters
          method: req.method,
          path: req.path,
          startTime: new Date().toISOString(),
          message:`Hello World, Pathparam: ${pathParam}, Queryparam: ${message || "none"}`
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


// Metadata service URL
const METADATA_URL = "http://169.254.169.254/latest/meta-data";

// Step 1: Fetch the token
const fetchToken = async () => {
  try {
    const response = await axios.put(
      "http://169.254.169.254/latest/api/token",
      {},
      {
        headers: {
          "X-aws-ec2-metadata-token-ttl-seconds": "21600", // Token valid for 6 hours
        },
        timeout: 2000, // 2-second timeout
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching token:", error.message);
    return null;
  }
};

// Step 2: Fetch metadata using the token
const fetchMetadata = async (token, path) => {
  try {
    const response = await axios.get(`${METADATA_URL}/${path}`, {
      headers: {
        "X-aws-ec2-metadata-token": token,
      },
      timeout: 2000, // 2-second timeout
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching metadata:", error.message);
    return null;
  }
};

// Main function
const getInstanceIpAddress = async () => {
  const token = await fetchToken();
  if (!token) {
    console.log("Failed to fetch token. Exiting.");
    return;
  }

  // Fetch the private IP address
  const privateIp = await fetchMetadata(token, "local-ipv4");
  if (privateIp) {
    console.log(`Private IP Address: ${privateIp}`);
  } else {
    console.log("Failed to fetch private IP address.");
  }
  return privateIp
};
