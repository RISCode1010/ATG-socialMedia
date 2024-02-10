const router = require('express').Router();
const authCtrl = require('../controllers/authController');
const auth = require('../middlewares/auth');


router.post('/register', authCtrl.register);
router.post("/changePassword", auth, authCtrl.changePassword);
router.post("/login", authCtrl.login);
router.post("/logout", authCtrl.logout);
router.post("/forgotPassword", authCtrl.forgotPassword);
router.put("/resetPassword/:token", authCtrl.resetPassword);

router.post("/refresh_token", authCtrl.generateAccessToken);


module.exports = router;