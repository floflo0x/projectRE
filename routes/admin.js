const express = require('express');

const axios = require('axios');

const router = express.Router();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Stripe = require('./stripe');

router.get("/", async (req, res, next) => {
	return res.render("home", {
		title: "HOME"
	})
})

router.get("/plans", async (req, res, next) => {
	try {
		const products = await stripe.products.list({
			active: true,
		}); 

		// console.log(products.data);

		const prices = await stripe.prices.list({
		  	active: true,
		}); 

		// console.log(prices.data);

		const plans = products.data.map((product, index) => {
		    const matchingPrice = prices.data.find(price => price.id === product.default_price);
		    return {
		        // product_id: product.id,
		    	// price_id: matchingPrice.id,
		    	id: index+1,
		        name: product.name,
		        description: product.description,
		        amount: matchingPrice.unit_amount_decimal
		    };
		});

		// console.log(plans);

		// const pricePromises = products.data.map(async (product) => {
		//     return await stripe.prices.retrieve(product.default_price);
		// });

		// Use Promise.all to wait for all price retrievals to complete
		// const prices = await Promise.all(pricePromises);

		// console.log(prices);

		return res.render("products", {
			title: "PLANS",
			plans
		})
	}

	catch(error) {
		console.log(error);
	}
})

router.get("/subscribe", async (req, res, next) => {
	try {
		// const customer = await stripe.customers.list({
		// 	email: email
		// })
		// const customerId = customer.data[0].id;

		const plan = req.query.plan || '';

		let priceID;

		switch (plan.toLowerCase()) {
			case 'starter':
				priceID = 'price_1QG1qLRsqujY6sE37DmiSVhS';
				break;
			case 'pro':
				priceID = 'price_1QG1rbRsqujY6sE3RdK53LgT';
				break;
			default: 
				return res.redirect("/plans");
		}

		const session = await stripe.checkout.sessions.create({
			mode: 'subscription',
			payment_method_types: ["card"],
			// customer: customerId,
			line_items: [
			    {
			      price: priceID,
			      quantity: 1,
			    },
			],
		  	success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
		  	cancel_url: `${process.env.BASE_URL}/cancel`
		});

		// console.log(session);

		return res.redirect(session.url);
	}

	catch(error) {
		console.log(error);
		return res.redirect("/plans");
	}
})

router.get("/success", async (req, res, next) => {
	try {
		const session_id = req.query.session_id || '';

		const session = await stripe.checkout.sessions.retrieve(
			session_id, 
			{ expand: ['subscription', 'subscription.plan.product', 'invoice']}
		);

		// console.log(JSON.stringify(session.invoice));

		return res.render("success", {
			title: "SUCCESS",
			cID: session.customer
		})
	}

	catch(error) {
		console.log(error);
		return res.redirect("/plans");
	}
})

router.get("/cancel", async (req, res, next) => {
	try {
		return res.send("Sorry you are not subscribed...");
	}

	catch(error) {
		console.log(error);
		return res.redirect("/plans");
	}
})

router.get("/customer/:customerID", async (req, res, next) => {
	try {
		const portalSession = await stripe.billingPortal.sessions.create({
			customer: req.params.customerID,
			return_url: `${process.env.BASE_URL}/plans`
		})

		// console.log(portalSession);

		return res.redirect(portalSession.url);
	}

	catch(error) {
		console.log(error);
	}
})

router.post("/webhooks", (req, res, next) => {
	return res.send("hii");
})

module.exports = router;