'use strict';

/**
 * order router.
 */

module.exports = {
    routes: [
        { // Path defined with a regular expression
            method: 'POST',
            path: '/order/stripe', // Only match when the first parameter contains 2 or 3 digits.
            handler: 'order.createStripe',
        },
        { // Path defined with a regular expression
            method: 'POST',
            path: '/order/pagseguro', // Only match when the first parameter contains 2 or 3 digits.
            handler: 'order.createPagSeguro',
        },
        { // Path defined with a URL parameter
            method: 'GET',
            path: '/order',
            handler: 'order.find',
        },
        { // Path defined with a URL parameter
            method: 'GET',
            path: '/order/:id',
            handler: 'order.findOne',
        },
        { // Path defined with a regular expression
            method: 'DELETE',
            path: '/order/:id', // Only match when the first parameter contains 2 or 3 digits.
            handler: 'order.delete',
        },
        { // Path defined with a regular expression
            method: 'PUT',
            path: '/order/:id', // Only match when the first parameter contains 2 or 3 digits.
            handler: 'order.update',
        },
    ]
}