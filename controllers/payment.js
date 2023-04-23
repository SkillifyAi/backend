require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Payment = require('../models/payment')
const mongoose = require('mongoose');
const User = mongoose.model("User")

const createCheckout =  async (req, res) => {
    const priceId = req.body.priceId

    console.log(priceId);

    try {
        const user = await User.findById(req.userId)
         
        const session = await stripe.checkout.sessions.create({
            mode:'subscription',
            metadata: {
                userEmail: user.email
            },
            line_items:[
                {
                    price: priceId,
                    quantity: 1,
                }
            ],
            success_url: 'http://localhost:3000/payment-succes',
            cancel_url: 'http://localhost:3000/pricing'
        })
        res.status(200).json({succes: true, url: session.url})
    } catch (err) {
      console.log(err);
        res.status(500).json({succes:false, message: err})
    }
}

const handleCheckout = async (req, res, next) => {
    
    let data;
    let eventType;
    // Check if webhook signing is configured.
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (webhookSecret) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers["stripe-signature"];
      

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.log(err);
        console.log(`⚠️  Webhook signature verification failed.`);
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      data = event.data;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req.body.data;
      eventType = req.body.type;
    }
    
    switch (eventType) {
        case 'checkout.session.completed':
        
            const session = data.object;
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            const productId = subscription.plan.product;
            const product = await stripe.products.retrieve(productId);
            
            const user = await User.findOne({email: session.metadata.userEmail})

            const payment = new Payment({
              user: user.id,
              stripeCustomerId: session.customer,
              amount: session.amount_total,
              currency: session.currency,
            });

            await payment.save();

            const productType = product.name.split(' ')[1]

            if(productType === 'Pro') {
              user.planType = 'Pro'
              user.planNumber = 5
              user.alternativePlans = 1
            } else if(productType === "Premium") {
              user.planType = 'Premium'
              user.planNumber = 20
              user.alternativePlans = 4
            } else if(productType === "Enterprise") {
              user.planType = 'Enterprise'
              user.planNumber = -1
              user.alternativePlans = -1
            }
            user.customerId = session.id
            await user.save()
          
          break;
        default:
            console.log("Event unhandled");
            break;
      }
  
    res.sendStatus(200)
  }

const handlePortal = async (req, res) => {

  try {
    
    const user = await User.findOne({email: req.body.email})
    
    const customerId = user.customerId
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
    })
    res.status(200).json({succes:true, url: portalSession.url})
  } catch (err) {
    console.log(err);
    res.status(500).json({succes:false, error: err})
  }

}

module.exports.createCheckout = createCheckout
module.exports.handleCheckout = handleCheckout
module.exports.handlePortal = handlePortal