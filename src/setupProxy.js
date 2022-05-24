const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: "https://api.ocp410.sandbox1118.opentlc.com:6443",
      changeOrigin: true,
      secure: false,
    })
  );
};
