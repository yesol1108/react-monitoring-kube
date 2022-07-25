const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: "https://api.cluster-58tgj.58tgj.sandbox990.opentlc.com:6443",
      changeOrigin: true,
      secure: false,
    })
  );
};
