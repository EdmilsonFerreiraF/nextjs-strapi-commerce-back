'use strict';

/**
 * Order.js controller
 *
 * @description: A set of functions called "actions" for managing `Order`.
 */

const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios')
const stripe = require('stripe')('sk_test_51KOP3uHbz4bukEWOWL8CLwqEzuF9kzvOqTFl6K1JzEqA9oTMRO8bBQa4LbdZ71UYw4eUDFKISuXd39Rb04tgd3bN00P7I1DioX');
const Base64 = require('js-base64');
const fs = require('fs')
const path = require('path')
const https = require('https')

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
    /**
     * Create a/an order record.
     *
     * @return {Object}
     */
    createStripe: async (ctx) => {
        const customerData = ctx.request.body.customer

        const {
            currency,
            amount,
            payment_method_types,
            setup_future_usage,
        } = ctx.request.body


        const customer = await stripe.customers.create({
            description: customerData.description
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
    authPIX: async (agent) => {
        const clientID = process.env.CLIENT_ID
        const clientSecret = process.env.CLIENT_SECRET
        const credential = Buffer.from(`${clientID}:${clientSecret}`).toString('base64')

        const authOptions = {
            httpsAgent: agent,
            headers: {
                Authorization: `Basic ${credential}`
            }
        };

        const authBody = {
            grant_type: 'client_credentials', scope: 'cob.write'
        }

        const resAuth = await axios.post("https://secure.sandbox.api.pagseguro.com/pix/oauth2",
            authBody,
            authOptions,
        )
            .then(result => { console.log('result', result); return result.data.access_token })
            .catch(error => console.log('error', error.response ? error.response.data.error_messages : error));

        return resAuth
    },

    createPagSeguroPIX: async (ctx) => {
        const {
            calendario,
            devedor,
            valor,
            chave,
            solicitaoPagador,
            infoAdicionais
        } = ctx.request.body

        const token = process.env.PIX_TOKEN

        try {
            const clientId = fs.readFileSync(
                "certs/Futura_Sand.key"
            )

            const clientSecret = fs.readFileSync(
                "certs/Futura_Sand.pem"
            )

            const agent = new https.Agent({
                key: clientId,
                cert: clientSecret,
                passphrase: ''
            })

            const resAuth = authPIX(agent);

            const chargeOptions = {
                httpsAgent: agent,
                headers: {
                    Authorization: `Bearer ${resAuth}`
                }
            };

            const chargeBody = ctx.request.body

            const res = await axios.put(`https://secure.sandbox.api.pagseguro.com/instant-payments/cob/123BAJDH1JASHjvkae123kejauuj746`,
                chargeBody,
                chargeOptions
            )
                .then(result => { console.log('result', result); return result })
                .catch(error => console.log('error', error.response ? error.response.data.error_messages : error));

            return res
        } catch (err) {
            console.log('err', err)
            ctx.body = err;
        }
    },
    // find: async (ctx) => {
    //     const { data, meta } = await super.find(ctx);

    //     return { data, meta };
    // },
    createPagSeguro: async (ctx) => {
        const {
            // reference_id,
            customer,
            items,
            // qr_code,
            shipping,
            charges,
            notification_urls
        } = ctx.request.body

        try {
            const res = await axios.put('sandbox.api.pagseguro.com/orders',
                ctx.request.body,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            )
                .then(res => {
                    console.log('res', res)

                    return res
                })
                .catch(err => console.log('err', err.response.data.error_messages))

            return res
        } catch (err) {
            ctx.body = err;
        }
    },
}))