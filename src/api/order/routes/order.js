'use strict';

/**
 * order router.
 */

module.exports = {
    routes: [
        { // Path defined with a regular expression
            method: 'POST',
            path: '/orders/stripe', // Only match when the first parameter contains 2 or 3 digits.
            handler: 'order.createStripe',
        },
        { // Path defined with a regular expression
            method: 'POST',
            path: '/orders/pagseguro', // Only match when the first parameter contains 2 or 3 digits.
            handler: 'order.createPagSeguro',
        },
        { // Path defined with a URL parameter
            method: 'GET',
            path: '/orders',
            handler: 'order.find',
        },
        { // Path defined with a URL parameter
            method: 'GET',
            path: '/orders/:id',
            handler: 'order.findOne',
        },
        { // Path defined with a regular expression
            method: 'DELETE',
            path: '/orders/:id', // Only match when the first parameter contains 2 or 3 digits.
            handler: 'order.delete',
        },
        { // Path defined with a regular expression
            method: 'PUT',
            path: '/orders/:id', // Only match when the first parameter contains 2 or 3 digits.
            handler: 'order.update',
        },
    ]
}