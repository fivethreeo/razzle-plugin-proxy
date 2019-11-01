'use strict';

const url = require('url');

function modify(defaultConfig, { target, dev }, webpack) {
  const config = defaultConfig;

  if ( target==='web' && dev ) {

    const { host: hotDevClientPublic, port, pathname } = url.parse(config.output.publicPath);
    const hotDevClientPort = port ? port : '';
    const hotDevClientPath = pathname ? pathname : '/';

    config.devServer.quiet = false;
    config.devServer.public = hotDevClientPublic;
    // upgrade webpack dev server sockPath 3.1.4 -> 3.2.0
    // config.devServer.sockPath = `${hotDevClientPath}/sockjs-node`;

    config.module.rules = config.module.rules.reduce((rules, rule) => {
      
      if (rule.test &&
        rule.test.toString()===/\.(js|jsx|mjs)$/.toString() &&
        !rule.enforce) {

        const { use, ...rest } = rule;

        rules.push({ ...rule, ...{
          exclude: [
            /razzle-dev-utils\/webpackHotDevClient\.js/,
            /webpack-dev-server\/client\/utils\/createSocketUrl\.js/          ]
        }});

        rules.push({ ...rest, ...{
          use: [ ...use, {
              loader: require.resolve('string-replace-loader'),
              options: {
                multiple: [
                  {
                    search: 'port: parseInt(process.env.PORT || window.location.port, 10) + 1,'
                      .replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&'),
                    replace: `port: '${hotDevClientPort}',`,
                    flags: 'g',
                    strict: true
                  },
                  {
                    search: 'pathname: \'/sockjs-node\','
                      .replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&'),
                    replace: `pathname: '${hotDevClientPath}sockjs-node',`,
                    flags: 'g',
                    strict: true
                  }
                ]
              }
            }
          ],
          include: [
            /razzle-dev-utils\/webpackHotDevClient\.js/,
          ],
        }});

        rules.push({ ...rest, ...{
          use: [ ...use, {
              loader: require.resolve('string-replace-loader'),
              options: {
                multiple: [
                  {
                    search: 'var sockPath = \'\/sockjs-node\';'
                      .replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&'),
                    replace: `var sockPath = \'${hotDevClientPath}sockjs-node\';`,
                    flags: 'g',
                    strict: true
                  }
                ]
              }
            }
          ],
          include: [
            /webpack-dev-server\/client\/utils\/createSocketUrl\.js/
          ],
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
