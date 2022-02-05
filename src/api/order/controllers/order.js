'use strict';

/**
 * Order.js controller
 *
 * @description: A set of functions called "actions" for managing `Order`.
 */

const { createCoreController } = require('@strapi/strapi').factories;

const stripe = require('stripe')('sk_test_51KOP3uHbz4bukEWOWL8CLwqEzuF9kzvOqTFl6K1JzEqA9oTMRO8bBQa4LbdZ71UYw4eUDFKISuXd39Rb04tgd3bN00P7I1DioX');

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  /**
   * Create a/an order record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    const customer = await stripe.customers.create({
      description: 'My First Test Customer',
    });
  }
}))