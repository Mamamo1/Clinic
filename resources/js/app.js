const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Use bodyParser to parse JSON data from the request body
app.use(bodyParser.json());

// Sample signup route
app.post('/api/signup', (req, res) => {
    const { username, password, email } = req.body;

    // Perform necessary validation and user creation logic here
    // Example: Save user to the database

    // If the signup is successful
    res.status(201).json({ message: 'User created successfully!' });

    // If there’s an error, you can send an error response
    // res.status(400).json({ message: 'Error message' });
});

// Set the port for your server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
