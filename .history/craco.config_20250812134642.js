const path = require('path');

module.exports = {
  plugins: [
    {
      plugin: {
        overrideWebpackConfig: ({webpackConfig}) => {
          enableImportsFromExternalPaths(webpackConfig, [
            // Add the paths here
            path.resolve(__dirname, '/shared'),
          ]);
          return webpackConfig;
        },
      },
    },
  ]
}

/**
 *
 * Functions to enable…
