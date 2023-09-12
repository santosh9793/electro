import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        firstName: String,
        lastName: String,
        email: {
            type: String,
            index: true,
            unique: true,
            required: true
        },
        phone: {
            type: Number,
            index: true,
            minlength: [10, "Min 10"],
            required: true,
            unique: true
        },
        password: String,
        otp: {
            type: Number,
            default: ''
        },
        expTime: {
            type: Number,
            default: ''
        },
        wishlist: [{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'product',
        }
        ],
        role: {
            //1=>admin,2=>user,3=>vender
            type: String,
            enum: ['1', '2', '3'],
            default: '2'
        },
        /* roles: {
            //act like a array of string
            type: [String],
            enum: ["admin", "user", "vendor"],
            default: ["user"]
        }, */
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model("User", userSchema);

export default User;
