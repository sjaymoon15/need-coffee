const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');
require('dotenv').config();
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(422).send({ error: 'Email is in use' });
  }

  try {
    const user = new User({
      email,
      password,
      first_name,
      last_name
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, jwtSecretKey);
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).send({ error: 'Must provide email and password' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).send({ error: 'Invalid password or email' });
  }

  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, jwtSecretKey);
    res.send({ token });
  } catch (err) {
    return res.status(422).send({ error: 'Invalid password or email' });
  }
});

router.post('/user', async (req, res) => {
  const { email } = req.body;
  const searchKey = new RegExp(email, 'i');

  try {
    const users = await User.find({ email: searchKey }).limit(10);
    res.send(users);
  } catch (err) {
    return res.status(422).send({ error: `Can't find the user email` });
  }
});

module.exports = router;
