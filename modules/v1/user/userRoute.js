const express = require("express");

const userCtr = require("./userController");
const middleware = require("../../../middleware");
const userMiddleware = require("./userMiddleware");
const validationRules = require("./userValidationRules");

const userRouter = express.Router();

// Inject Validation Rules
userRouter.use((req, res, next) => {
    if (req.method !== "OPTIONS") {
        req.validations = validationRules.get(req.path);
        middleware.reqValidator(req, res, next);
    } else {
        next();
    }
});

// Routes
userRouter.post("/signup", userCtr.signup);

userRouter.post("/authenticate", userCtr.authenticate);

userRouter.post("/authenticate-provider", userCtr.authenticateProvider);

userRouter.post("/send-verification-code",
    userMiddleware.loadUser,
    userMiddleware.isUserBlocked,
    userCtr.sendVerificationCode
);

userRouter.post("/verify-otp",
    userMiddleware.loadUser,
    userMiddleware.isUserBlocked,
    userCtr.verifyOTP
);

userRouter.post("/profile",
    userMiddleware.loadUser,
    userMiddleware.isUserBlocked,
    userCtr.getProfile
);


module.exports = userRouter;