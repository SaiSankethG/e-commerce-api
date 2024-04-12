const router = require("express").Router()
const Order = require("../models/Order")
const { verifyToken, verifyTokenAndAdmin, verifyTokenAndAuthorization } = require("./verifyToken")

//Create order
router.post("/", verifyToken, async(req, res)=>{
    try{
        const order = new Order(req.body)
        const saveOrder = await order.save();
        res.status(200).json(saveOrder)
    }catch(err){
        res.status(500).json(err)
    }
})

//Update
router.put("/:id", verifyTokenAndAdmin, async(req, res)=>{
    try{    
        const updateOrder = await Order.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new: true})
        res.status(200).json(updateOrder)
    }catch(err){
        res.status(500).json(err)
    }
})

//Delete
router.delete("/:id", verifyTokenAndAdmin, async(req, res)=>{
    try{
        await Order.delete(req.params.id)
        res.status(200).json("Order has been deleted...")
    }catch(err){
        res.status(500).json(err)
    }
})

//Get user orders.
router.get("/find/:userId", verifyTokenAndAuthorization , async(req, res)=>{
    try{
        const orders = await Order.find({ userId: req.params.id})
        res.status(200).json(orders)
    }catch(err){
        res.status(500).json(err)
    }
})

//Get all orders.
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    try {
        const income = await Order.aggregate([
        { $match: { createdAt: { $gte: previousMonth } } },
        {
            $project: {
            month: { $month: "$createdAt" },
            sales: "$amount",
            },
        },
        {
            $group: {
            _id: "$month",
            total: { $sum: "$sales" },
            },
        },
        ]);
        res.status(200).json(income);
    } catch (err) {
        res.status(500).json(err);
    }
});  

module.exports = router