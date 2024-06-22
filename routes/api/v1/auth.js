const express = require('express');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { zod_validation_errors } = require('../../../utils/helper');
const User = require('../../../models/User');
const authMiddleware = require('../../../middlewares/auth');
const Settings = require('../../../models/Settings');
const { default: axios } = require('axios');
const router = express.Router();


// Authentication route (login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const request_role = req.headers['x-api-role'] ?? 'user';

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(422).json({ errors: { email: ['Invalid email or password'] } });
        }

        // Check if the password is correct
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(422).json({ errors: { email: ['Invalid email or password'] } });
        }


        if (request_role !== user.role) {
            return res.status(422).json({ errors: { email: ['Unauthorized'] } });

        }


        // Create and send JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET_KEY, {
            expiresIn: '1h'
        });

        res.json({ token: token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Client Authentication route (login)
router.post('/client/login', async (req, res) => {
    const { email } = req.body;

    try {        
        const access_token = await Settings._get('gvm_access_token');

        if (access_token) {

            const url = `${process.env.GVM_API_HOST}/events/${process.env.GVM_EVENT_ID}/attendees`;
            const fd = new FormData();

            // muhammad_ariff_munshi@singaporeglobalnetwork.sg

            fd.append("where[email]", email);

            const result = await axios.post(url, fd, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });


            const users = result.data.data;

            if (users.length > 0) {

                const user = users[0];

                // Create and send JWT token


                const _user = await User.updateOrCreate(email, {
                    name: user.firstname,
                    email: email,
                    password:'user_password',
                    role:'user'
                });


                const token = jwt.sign({ id: _user._id, role: _user.role }, process.env.SECRET_KEY, {
                    expiresIn: '1h'
                });



                res.json({ token: token, user: { id: _user._id, name: _user.name, email: _user.email } });

            } else {
                return res.status(422).json({ errors: { email: ['Invalid email'] } });
            }

        } else {
            
            throw new Error('Access token not found');
        }





    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Registration route (register)
router.post('/register', async (req, res) => {

    const { name, email, password } = req.body;

    // validate with zod
    const userSchema = z.object({
        name: z.string().min(3, 'Name must be at least 3 characters long'),
        email: z.string().email('Invalid email'),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
    });

    try {

        userSchema.parse(req.body);

        const user = new User({ name, email, password, 'role': 'user' });

        await user.save();

        // Create and send JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET_KEY, {
            expiresIn: '1h'
        });

        res.status(201).json({ token });


    } catch (error) {

        console.log(error);

        if (error.code === 11000) {
            return res.status(422).json({ errors: { email: ['Email already exists'] } });
        }

        return res.status(422).json(zod_validation_errors(error));
    }





});

// ping route
router.get('/ping', authMiddleware, (req, res) => {
    res.send('alive');
});


module.exports = router;
