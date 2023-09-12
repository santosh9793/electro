import express from "express";
const router = express.Router();

import authController from "../controllers/authController.js";
import upload from "../middlewares/upload.js";
import authenticate from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

router.post("/signup", upload.none(), authController.registerUser);
router.post("/signin", upload.none(), authController.loginUser);
router.post("/changepassword", authenticate, upload.none(), authController.changePassword);
router.get("/user-auth", authenticate, (req, res) => {
    res.status(200).send({ ok: true })
});
router.get("/admin-auth", authenticate, isAdmin, (req, res) => {
    res.status(200).send({ ok: true })
});
router.get("/:id", authenticate, authController.findUserById);
router.put("/updateprofile/:id", authenticate, upload.none(), authController.updateUser);
router.post("/forgetpassword", upload.none(), authController.forgetPassword);
router.post("/resetpassword", upload.none(), authController.resetPassword);

export default router;