const mongoose =
    require("mongoose");

const bcrypt =
    require("bcrypt");


const userSchema =
    new mongoose.Schema(
        {

            name: {
                type: String,
                required: true,
                trim: true
            },

            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true
            },

            password: {
                type: String,
                required: true,
                minlength: 6
            },

            loginOtpHash: {
    type: String,
    default: null
},

loginOtpExpires: {
    type: Date,
    default: null
},

loginOtpAttempts: {
    type: Number,
    default: 0
},

resetOtpHash: {
    type: String,
    default: null
},

resetOtpExpires: {
    type: Date,
    default: null
},

resetOtpAttempts: {
    type: Number,
    default: 0
},

            resetPasswordToken: {
                type: String,
                default: null
            },

            resetPasswordExpires: {
                type: Date,
                default: null
            }

        },
        {
            timestamps: true
        }
    );


// =====================================
// HASH PASSWORD
// =====================================

userSchema.pre(
    "save",
    async function () {

        if (
            !this.isModified(
                "password"
            )
        ) {

            return;

        }


        this.password =
            await bcrypt.hash(
                this.password,
                10
            );

    }
);


// =====================================
// COMPARE PASSWORD
// =====================================

userSchema.methods.comparePassword =
    async function (
        enteredPassword
    ) {

        return bcrypt.compare(
            enteredPassword,
            this.password
        );

    };


module.exports =
    mongoose.model(
        "User",
        userSchema
    );