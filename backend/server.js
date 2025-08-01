// server.js
// This file sets up a basic Node.js server using the Express.js framework,
// with added functionality to send emails using Nodemailer for 2FA.

// 1. Import necessary modules
const express = require('express');
const nodemailer = require('nodemailer'); // Import Nodemailer
const cors = require('cors'); // Import CORS middleware for cross-origin requests

// 2. Create an Express application instance
const app = express();

// 3. Define the port the server will listen on
const PORT = process.env.PORT || 3001; // Changed default port to 3001 to avoid conflict with React dev server

// 4. Middleware: Enable JSON body parsing and CORS
app.use(express.json()); // Allows parsing of JSON request bodies
app.use(cors()); // Enables CORS for all routes, allowing your React app to make requests

// 5. Configure Nodemailer transporter
// IMPORTANT: For production, use environment variables (process.env.EMAIL_USER, process.env.EMAIL_PASS)
// and a dedicated email sending service (e.g., SendGrid, Mailgun, AWS SES) instead of personal Gmail.
// If using Gmail, you might need to enable "Less secure app access" or use App Passwords.
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your email service provider (e.g., 'Outlook365', 'SendGrid')
    auth: {
        user: process.env.EMAIL_USER || 'your_email@gmail.com', // Replace with your email
        pass: process.env.EMAIL_PASS || 'your_email_password' // Replace with your email password or app password
    }
});

// 6. Define a basic route for the root URL ('/')
app.get('/', (req, res) => {
    res.json({ message: 'Hello from your Node.js server!' });
});

// 7. Define another route for a specific endpoint ('/api/greet')
app.get('/api/greet', (req, res) => {
    const name = req.query.name || 'Guest';
    res.json({ greeting: `Hello, ${name}!` });
});

// 8. Define a POST route example ('/api/data')
app.post('/api/data', (req, res) => {
    const receivedData = req.body;
    console.log('Received POST data:', receivedData);
    res.json({ message: 'Data received successfully!', yourData: receivedData });
});

// 9. NEW: Endpoint to send 2FA email
app.post('/api/send-2fa-email', async (req, res) => {
    const { email, code } = req.body; // Expect email and code in the request body

    if (!email || !code) {
        return res.status(400).json({ error: 'Email and code are required.' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER || 'your_email@gmail.com', // Sender address
        to: email, // Recipient address
        subject: 'Your StellarMind AI Two-Factor Authentication Code', // Subject line
        html: `<p>Your 2FA code for StellarMind AI is: <strong>${code}</strong></p>
               <p>This code is valid for a short period. Do not share it with anyone.</p>` // HTML body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`2FA email sent to ${email} with code ${code}`);
        res.status(200).json({ message: '2FA code email sent successfully!' });
    } catch (error) {
        console.error('Error sending 2FA email:', error);
        res.status(500).json({ error: 'Failed to send 2FA code email.', details: error.message });
    }
});

// 10. Start the server and listen for incoming requests on the defined PORT
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server.');
});

/*
To run this server:

1.  Save the code above as `server.js` in a new folder (e.g., `my-node-server`).
2.  Open your terminal or command prompt.
3.  Navigate to that folder: `cd my-node-server`
4.  Initialize a Node.js project (if you haven't already): `npm init -y`
5.  Install Express.js and Nodemailer: `npm install express nodemailer cors`
6.  Set up environment variables (IMPORTANT for security and functionality):
    Create a `.env` file in the same directory as `server.js` and add:
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_email_password_or_app_password

    If you're using Gmail, you might need to generate an "App Password" for security:
    Go to your Google Account -> Security -> 2-Step Verification -> App passwords.
    You'll need 2-Step Verification enabled to see this option.

    Alternatively, for development, you can temporarily enable "Less secure app access"
    in your Google Account settings, but this is NOT recommended for production.

7.  Run the server: `node server.js`

You should see "Server is running on http://localhost:3001" in your terminal.
*/
