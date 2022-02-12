'use strict';

/**
 * Order.js controller
 *
 * @description: A set of functions called "actions" for managing `Order`.
 */

const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios')
const stripe = require('stripe')('sk_test_51KOP3uHbz4bukEWOWL8CLwqEzuF9kzvOqTFl6K1JzEqA9oTMRO8bBQa4LbdZ71UYw4eUDFKISuXd39Rb04tgd3bN00P7I1DioX');

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
    /**
     * Create a/an order record.
     *
     * @return {Object}
     */
    createStripe: async (ctx) => {
        const {
            description: { costumer: { description } },
            currency,
            amount,
            payment_method_types,
            setup_future_usage,
        } = ctx.request.body

        console.log('description', description)

        const customer = await stripe.customers.create({
            description
        });

        const paymentIntent = await stripe.paymentIntents.create({
            customer: customer.id,
            currency,
            amount,
            payment_method_types,
            setup_future_usage,
        });

        return { clientSecret: paymentIntent.client_secret }
    },
    createPagSeguro: async (ctx) => {
        const token = "5D3179F168F94D11B1C9834A3C154139"

        try {

            const res = await axios.post('https://sandbox.api.pagseguro.com/orders',
            ctx.request.body,
            
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                },
            )
            .then(res => {
                return res
            })
            .catch(err => console.log('err', err.response.data.error_messages))

            return res
        } catch (err) {
            console.log('err', err)
            ctx.body = err;
        }
    },
}))