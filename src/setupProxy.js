const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://api.ocp49.sandbox1411.opentlc.com:6443",
      changeOrigin: true,
    })
  );
};
