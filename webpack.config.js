// webpack.config.js
module.exports = async function (env, argv) {
  const config = await require('@expo/webpack-config')(env, argv);

  config.devServer = {
    ...config.devServer,
    hot: true,
    watchFiles: ['**/*.tsx', '**/*.ts', '**/*.js'], // Watch TS/JS files
  };

  return config;
};
