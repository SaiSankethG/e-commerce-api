const router = require("express").Router();
const dotenv = require('dotenv');
dotenv.config();
const Stripe = require("stripe")(process.env.STRIPE_KEY);

// Define your minimum amount in INR
const MINIMUM_AMOUNT_INR = 0.50; 

router.post("/payment", async (req, res) => {
    // console.log("inside payment");
    try {
        const { tokenId, amount } = req.body;

        // Check if the amount meets the minimum requirement
        if (amount < MINIMUM_AMOUNT_INR) {
            return res.status(400).json({ error: "Amount below minimum threshold." });
        }

        // Create a payment intent
        const paymentIntent = await Stripe.paymentIntents.create({
            amount,
            currency: "inr",
            payment_method_types: ['card'], // Specify payment method type
            payment_method_data: {
                type: 'card',
                card: {
                    token: tokenId
                }
            },
            confirm: true // Confirm the payment immediately
        });

        // Send the payment response
        res.status(200).json(paymentIntent);
        // console.log(paymentIntent);
    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({ error: "An error occurred while processing payment." });
    }
});

module.exports = router;
