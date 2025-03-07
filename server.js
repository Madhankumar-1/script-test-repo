const express = require('express');
const AWS = require('aws-sdk');
const app = express();
const port = 3000;

// Configure AWS SDK
AWS.config.update({ region: 'us-west-2' }); // Set your AWS region
const ec2 = new AWS.EC2();

// Middleware to parse JSON bodies
app.use(express.json());

// Generate a unique instanceId based on the current time
const generateInstanceId = () => {
  return `inst-${Date.now()}`;
};

// Function to fetch the EC2 instance's private IP address
const getInstanceIpAddress = async () => {
  try {
    const metadata = new AWS.MetadataService();
    return new Promise((resolve, reject) => {
      metadata.request('/latest/meta-data/local-ipv4', (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  } catch (error) {
    console.error('Error fetching instance IP address:', error);
    return null;
  }
};

// Endpoint to handle requests
app.get('/api', async (req, res) => {
  const { type, deployment } = req.query; // Query parameters

  // Fetch the EC2 instance's IP address
  const machineId = await getInstanceIpAddress();

  // Create the response object
  const response = {
    instanceId: generateInstanceId(), // Unique instanceId
    machineId: machineId || 'unknown', // EC2 instance IP address
    type: type || 'nodejs', // Default to 'nodejs' if not provided
    deployment: deployment || 'aws-ec2', // Default to 'aws-ec2' if not provided
    pathParams: req.params, // All path parameters
    queryParams: req.query, // All query parameters
    method: req.method, // HTTP method
    path: req.path, // Request path
    startTime: new Date().toISOString(), // Current time in ISO format
    message: 'Request processed successfully', // Custom message
  };

  // Send the JSON response
  res.json(response);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
