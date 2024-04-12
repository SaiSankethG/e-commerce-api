const router = require("express").Router()
const User = require("../models/User")
const CryptoJS = require("crypto-js")
const jwt = require("jsonwebtoken")

//Register
router.post("/register", async(req, res)=>{
    const newUser = new User({
        username:req.body.username,
        email:req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC),
    })
    try{
        const savedUser = await newUser.save()
        // console.log(savedUser)
        res.status(200).json(savedUser)
    }catch(err){
        res.status(500).json(err)
        console.log(err)
    }
})

//Login
router.post("/login", async(req, res)=>{
    try{
        const user = await User.findOne({username: req.body.username})
        if (!user) return res.status(401).json("Wrong user name");

        const originalPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC).toString(CryptoJS.enc.Utf8)
        const inputPassword = req.body.password

        if (originalPassword !== inputPassword) return res.status(401).json("Wrong password");
        const{password, ...others} = user._doc

        const token = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin
        },"secretkey",{expiresIn: "3d"})
        res.status(200).json({...others,token})
    }
    catch(err){
        console.log(err)
        res.status(500).json(err)
    }
})

module.exports = router