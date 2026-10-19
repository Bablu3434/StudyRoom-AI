const crypto =
    require("crypto");


// =====================================
// GENERATE 6 DIGIT OTP
// =====================================

function generateOtp() {

    return crypto
        .randomInt(
            100000,
            1000000
        )
        .toString();

}


// =====================================
// HASH OTP
// =====================================

function hashOtp(
    otp
) {

    return crypto
        .createHash(
            "sha256"
        )
        .update(
            otp
        )
        .digest(
            "hex"
        );

}


module.exports = {
    generateOtp,
    hashOtp
};