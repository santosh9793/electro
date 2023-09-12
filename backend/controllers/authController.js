import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../helpers/email.js"; // Imort sendEmail
import Joi from "joi"; // Import Joi for data validation

const authController = {
    registerUser: async (req, res) => {
        try {
            // Validate user input data
            const schema = Joi.object({
                firstName: Joi.string().min(3).required(),
                lastName: Joi.string().required(),
                email: Joi.string().email().required(),
                phone: Joi.string().regex(/^[0-9]{10}$/).messages({ 'string.pattern.base': `Phone number must have 10 digits.` }).required(),
                password: Joi.string().pattern(new RegExp('^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{3,30}$')).messages({ 'string.pattern.base': `Password must be between 3-30 characters & at least one special symble.` }).required(),
            }).unknown(true);
            const { error } = schema.validate(req.body);

            if (error) {
                return res.status(422).json({ success: false, message: error.details[0].message });
            }

            // Check if user already exists
            const userData = await User.findOne({ phone: req.body.phone });
            if (userData) {
                return res.status(422).json({ success: false, message: 'Phone already exists' });
            }

            // Create new user instance
            const userIns = new User(req.body);

            // Save user to database
            await userIns.save();
            return res.status(201).json({ success: true, message: 'Registered successfully' });

        } catch (error) {
            console.error("Error saving user:", error);
            return res.status(500).json({ success: false, message: 'Could not save the user to DB', error: error.message });
        }
    },
    loginUser: async (req, res) => {
        try {
            // Validate user input data
            const schema = Joi.object({
                phone: Joi.string().required(),
                password: Joi.string().required()
            });
            const { error } = schema.validate(req.body);

            if (error) {
                return res.status(422).json({ success: false, message: error.details[0].message });
            }
            // Object Destructuring is a JavaScript expression that allows us to extract data from arrays, objects, and maps and set them into new, distinct variables
            const { phone, password } = req.body;
            //if both feild name same so you can pass like below
            const user = await User.findOne({ phone });
            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    console.log(user);
                    //expiresIn: "10h" // it will be expired after 10 hours //expiresIn: "20d" // it will be expired after 20 days//expiresIn: 120 // it will be expired after 120ms //expiresIn: "120s" // it will be expired after 120s
                    jwt.sign({ phone: user.phone, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' }, (err, token) => {
                        return res.status(200).json({ success: true, message: "Login Successfully", user, token })
                    });
                } else {
                    return res.status(401).json({ success: false, message: 'Invalid credentials!' });
                }
            } else {
                return res.status(401).json({ success: false, message: 'Invalid credentials!' });
            }
        } catch (error) {
            console.error("Error make login:", error);
            return res.status(500).json({ success: false, message: 'Could not login', error: error.message });
        }
    },
    findUserById: async (req, res) => {
        const id = req.params.id;
        try {
            //const user = await User.findById(id).populate("wishlist", { title:1, price:1, image:1 });
            const user = await User.findById(id);
            if (!user) {
                return res.status(400).json({ success: false, message: 'User does not exist' });
            }
            return res.status(200).json({ success: true, message: 'User Info', user });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Could not fetch user', error: error.message });
        }
    },
    updateUser: async (req, res) => {
        try {
            // Validate user input data
            const schema = Joi.object({
                firstName: Joi.string().min(3).required(),
                lastName: Joi.string().required()
            }).unknown(true);
            const { error } = schema.validate(req.body);

            if (error) {
                return res.status(422).json({ success: false, message: error.details[0].message });
            }

            const id = req.params.id;
            const options = { new: true };

            const updateData = {
                firstName: req.body.firstName,
                lastName: req.body.lastName
            };

            const userInfo = await User.findByIdAndUpdate(id, updateData, options);

            //const userInfo = await User.findByIdAndUpdate(id, { firstName: req.body.firstName }, options);
            //if you want update specofix field only

            if (!userInfo) {
                return res.status(422).json({ success: false, message: 'User does not exist' });
            }

            return res.status(200).json({ success: true, message: 'User updated successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Could not update', error: error.message });
        }
    },
    changePassword: async (req, res) => {
        try {
            // Validate user input data
            const schema = Joi.object({
                id: Joi.string().required(),
                password: Joi.string().required(),
                new_password: Joi.string().required()
            }).unknown(true);
            const { error } = schema.validate(req.body);
            if (error) {
                return res.status(422).json({ success: false, message: error.details[0].message });
            }

            const { id, password, new_password } = req.body;

            // when you only want to query documents by id, it is better to use the findById() method
            const userInfo = await User.findById(id);
            if (userInfo) {
                const isMatch = await bcrypt.compare(password, userInfo.password);
                if (isMatch) {
                    const hashPassword = await bcrypt.hash(new_password, 10);
                    // when you only want to update documents by id, it is better to use the findByIdAndUpdate() method
                    await User.findByIdAndUpdate(id, { password: hashPassword });
                    return res.status(200).json({ success: true, message: "Password updated successfully" });
                } else {
                    return res.status(422).json({ success: false, message: 'Old Password does not match' });
                }
            } else {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Could not update password', error: error.message });
        }
    },
    forgetPassword: async (req, res) => {
        try {
            // Validate user input data using Joi schema
            const schema = Joi.object({
                email: Joi.string().email().required()
            });

            const { error } = schema.validate(req.body);

            if (error) {
                return res.status(422).json({ success: false, message: error.details[0].message });
            }

            const email = req.body.email;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(422).json({ success: false, message: "Email id does not exist" });
            }

            // Generate an OTP (One-Time Password) code and an expiration time
            const currentdate = new Date();
            const expTime = currentdate.getTime() + 300 * 1000; // Expiration time is set to 5 minutes from now
            const otpCode = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit OTP code
            const options = { new: true };

            // Update the user's record in the database with the new OTP and expiration time
            await User.updateOne({ email }, { otp: otpCode, expTime }, options);

            // Construct the reset password link
            const resetLink = `http://localhost:3000/reset-password/`;

            // Send an email with the reset password link and OTP code
            await sendEmail.send(
                '"San Kumar 👻" <ssharmagniit@gmail.com>', // Sender's name and email
                'ssharmagniit@gmail.com', // Recipient's email (user's email address)
                'ssharmagniit@gmail.com', // Reply-to email address
                'santosh9793@hotmail.com', // CC email address
                'Reset Password', // Email subject
                `Your OTP is: ${otpCode}, Click the link to reset your password: ${resetLink}` // Email body
            );
            return res.status(200).json({ success: true, message: "Reset link has been send on resgister email", otp: otpCode });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Something went wrong!', error: error.message });
        }
    },
    resetPassword: async (req, res) => {
        try {
            // Validate user input data using Joi schema
            const schema = Joi.object({
                email: Joi.string().required(),
                otp: Joi.string().required(),
                new_password: Joi.string().required(),
                confirm_password: Joi.string().required().valid(Joi.ref('new_password')),
            });

            const { error } = schema.validate(req.body);

            if (error) {
                return res.status(422).json({ success: false, message: error.details[0].message });
            }

            // Extract necessary data from the request body
            const { email, otp, new_password } = req.body;

            // Find the user with the provided email and OTP in the database
            const user = await User.findOne({ email, otp });

            if (!user) {
                return res.status(422).json({ success: false, message: "Email id and OTP combination does not exist" });
            }

            // Calculate the time difference between current time and OTP expiration time
            const currentDate = new Date();
            const currentTime = currentDate.getTime();
            const diff = user.expTime - currentTime;
            //If diff is negative, it means that the OTP has already expired
            if (diff < 0) {
                return res.status(422).json({ success: false, message: "Token has expired" });
            }

            // Hash the new password using bcrypt
            const newPassword = await bcrypt.hash(new_password, 10);

            await User.updateOne({ email }, { password: newPassword });

            return res.status(200).json({ success: true, message: "Password updated successfully" });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
        }
    }
};

export default authController;
