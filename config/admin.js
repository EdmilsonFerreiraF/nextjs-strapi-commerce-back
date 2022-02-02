module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '99b5f012a669b952eae69747dd5fa9b9'),
  },
});
