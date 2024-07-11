// express instance
const express = require('express');

// define a route for users
const router = express.Router();

// Import the User Model
const User = require('../models/User');

// Import methods from authentication module
const { generateToken, verifyToken } = require('../Utils/auth');
const { append } = require('express/lib/response');


// API methods
// GET method
router.get('/', verifyToken, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } 
    catch (error) {
        res.status(500).send("Error: " + error);
    }
});

// GET my profile, authenticated
router.get('/me', verifyToken, async (req, res) => {
    try {
        const query = { _id: req.user.userId };
        const user = await User.findOne(query);
        if (user) {
            res.status(200).json(user); // Send userProfile in the response
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        res.status(500).send("Error: " + error);
    }
});

// GET particular user by id, through token
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const query = { _id: req.params.id };
        const user = await User.findOne(query);
        if (user) {
            res.status(200).json(user); // Send userProfile in the response
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        res.status(500).send("Error: " + error);
    }
});

// POST method
router.post('/', async (req, res) => {
    // creating a new User model
    const newUser = new User({
        username : req.body.username,
        email : req.body.email,
        phone : req.body.phone,
        password : req.body.password
    });

    // insert the document in collection
    try{
        const userAck = await newUser.save();
        res.status(200).json(userAck);
    }
    catch(error){
        res.status(500).send("Error: " + error);
    }
});

// Login
router.post('/login', async (req, res) => {
    // get email and password from req.body
    const { email, password } = req.body;

    // authenticate the user
    try{
        const user = await User.findOne({ email: email, password: password });
        if(!user){
            return res.status(401).send('Invalid credentials');
        }
        const isPasswordValid = password === user.password;
        if(!isPasswordValid){
            return res.status(401).send('Invalid ccredentials');
        }
        // generate the token
        const token = generateToken(user);
        res.status(200).json({ token });
    }
    catch(error){
        res.status(500).send('Error logging in: ' + error.message);
    }
});


// PUT method
router.put('', verifyToken, async (req, res) => {
    const { name, email, phone, password } = req.body;
    const updateField = { name, email, phone, password };

    try {
        const user = await User.findOne({ email: req.user.userId });
        if (!user || req.user.userId !== user._id.toString()) {
            return res.status(404).send("User doesn't exist or you are not authorized to update this user");
        } else {
            await User.updateOne({ _id: user._id }, { $set: updateField });
            res.send("User updated successfully");
        }
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});

// DELETE method
router.delete('', async (req, res) => {
    try{
        const user = await User.findOne({ _id: req.params.id });
        if (!user){
            res.status(404).send("User doesn't exist");
        }
        else{
            await User.deleteOne({ _id: req.params.id });
            res.send("User deleted succesfully");
        }
    }
    catch(error){
        res.status(500).send("Error: " + error);
    }
});

// PATCH method
router.patch('/:id', async ( req, res ) => {
    const { name, email, phone, password } = req.body;
    const updateParams = {}
    if (name){
        updateField.name = name;
    }
    if (email){
        updateField.email = email;
    }
    if (phone) {
        updateField.phone = phone;
    }
    if (password) {
        updateField.password = password;
    }
    try{
        const user = await User.findOne({ _id: req.params.id });
        if(!user){
            return res.status(400).send("User doesn't exist");
        }
        await User.updateOne({ email: req.body.email }, { $set: updateField }, { new: true, runValidators: true });
        res.send("User updated succesfully");
    }
    catch (error){
        res.status(500).send("Error: " + error);
    }
});


// export the users route
module.exports = router;