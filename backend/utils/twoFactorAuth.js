const speakeasy=require('speakeasy');

const generateSecret=()=>{
    return speakeasy.generateSecret({length:20})
}

const verifyToken =(secret,token)=>{
    console.log(secret,token)
    return speakeasy.totp.verify({
        secret:secret,
        encoding:'base32',
        token:token,
        window:2
    })
}

module.exports={generateSecret,verifyToken}