'use strict';

const url = require('url');

function modify(defaultConfig, { target, dev }, webpack) {
  const config = defaultConfig;

  if ( target==='web' && dev ) {

    const { host: hotDevClientPublic, port } = url.parse(config.output.publicPath);
    const hotDevClientPort = port ? port : '';

    config.devServer.public = hotDevClientPublic;
    
    config.module.rules = config.module.rules.reduce((rules, rule) => {
      if (rule.test &&
        rule.test.toString()===/\.(js|jsx|mjs)$/.toString() &&
        !rule.enforce) {

        const { use, ...rest } = rule;

        rules.push({ ...rule, ...{
          exclude: /razzle-dev-utils\/webpackHotDevClient\.js/
        }});

        rules.push({ ...rest, ...{
          use: [ ...use, {
            loader: require.resolve('string-replace-loader'),
            options: {
              search: 'port: parseInt(process.env.PORT || window.location.port, 10) + 1,'
                .replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&'),
              replace: `port: '${hotDevClientPort}',`,
              flags: 'g',
              strict: true
            }
          }],
          include: /razzle-dev-utils\/webpackHotDevClient\.js/,
        }});
      }
      else {
        rules.push(rule);
      } 
      return rules;
    }, []);
  }

  return config;
}

module.exports = modify;
