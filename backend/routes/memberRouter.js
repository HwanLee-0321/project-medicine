const express = require('express');
const router = express.Router();
const { signup, login, remove } = require('../controllers/memberCotroller');

router.post('/signup', signup);
router.post('/login', login);
router.post('/delete', remove);

module.exports = router;
