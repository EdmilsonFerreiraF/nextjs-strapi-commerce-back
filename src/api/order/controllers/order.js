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

        const token = "5D3179F168F94D11B1C9834A3C154139"

        try {
            const clientId2 = fs.readFileSync(
                "certs/Futura_Sand.key"
            )

            const clientSecret2 = fs.readFileSync(
                "certs/Futura_Sand.pem"
            )

            const agent = new https.Agent({
                key: clientId2,
                cert: clientSecret2,
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
            console.log('ctx.body', ctx.body)
            const res = await axios.put('sandbox.api.pagseguro.com/orders',
                ctx.request.body,

                // {
                //     // "reference_id": this.name,
                //     "customer": {
                //         "name": customer.name,
                //         "email": customer.email,
                //         "tax_id": customer.taxId,
                //         "phones": [
                //             {
                //                 "country": customer.phones.country,
                //                 "area": customer.phones.area,
                //                 "number": customer.phones.number,
                //                 "type": customer.phones.type,
                //             }
                //         ]
                //     },
                //     "items": [
                //         {
                //             "reference_id": items.reference_id,
                //             "name": items.name,
                //             "quantity": items.quantity,
                //             "unit_amount": items.unit_amount,
                //         }
                //     ],
                //     // "qr_code": {
                //     //     "amount": {
                //     //         "value": this.name,
                //     //     }
                //     // },
                //     "shipping": {
                //         "address": {
                //             "street": shipping.address.street,
                //             "number": shipping.address.number,
                //             "complement": shipping.address.complement,
                //             "locality": shipping.address.locality,
                //             "city": shipping.address.city,
                //             "region_code": shipping.address.region_code,
                //             "country": shipping.address.country,
                //             "postal_code": shipping.address.postal_code,
                //         }
                //     },
                //     "notification_urls": [
                //         notification_urls
                //     ],
                //     "charges": [
                //         {
                //             // "reference_id": charges.reference_id,
                //             "description": charges.description,
                //             "amount": {
                //                 "value": charges.amount.value,
                //                 "currency": charges.amount.currency,
                //             },
                //             "payment_method": {
                //                 "type": charges.payment_method.type,
                //                 "installments": charges.payment_method.installments,
                //                 "capture": charges.payment_method.capture,
                //                 "card": {
                //                     "number": charges.payment_method.card.number,
                //                     "exp_month": charges.payment_method.card.exp_month,
                //                     "exp_year": charges.payment_method.card.exp_year,
                //                     "security_code": charges.payment_method.card.security_code,
                //                     "holder": {
                //                         "name": charges.payment_method.card.holder.name,
                //                     },
                //                     "store": charges.payment_method.card.store,
                //                 }
                //             },
                //             "notification_urls": [
                //                 charges.notification_urls
                //             ]
                //         }
                //     ]
                // },
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

            console.log('res', res)
        } catch (err) {
            console.log('err', err)
            ctx.body = err;
        }
    },
}))