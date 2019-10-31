'use strict';

const url = require('url');

function modify(defaultConfig, { target, dev }, webpack) {
  const config = defaultConfig;

  if ( target==='web' && dev ) {

    const { host: hotDevClientPublic, port, pathname } = url.parse(config.output.publicPath);
    const hotDevClientPort = port ? port : '';
    const hotDevClientPath = pathname ? pathname : '/';

    config.devServer.public = hotDevClientPublic;

    config.devServer.sockPath = `${hotDevClientPath}/sockjs-node`;

    config.module.rules = config.module.rules.reduce((rules, rule) => {

      if (rule.loader
        && /file-loader|url-loader/.test(rule.loader)
        && rule.options && rule.options.name
        && /^static/.test(rule.options.name)) {

        const { options, ...newrule } = rule;

       const publicPath = config.output.publicPath
         .substring(0,config.output.publicPath.lastIndexOf('/') +1);

        rules.push({ options: { publicPath: publicPath, ...newoptions}, ...newrule});
      }
      else if (rule.test &&
        rule.test.toString()===/\.(js|jsx|mjs)$/.toString() &&
        !rule.enforce) {

        const { use, ...rest } = rule;

        rules.push({ ...rule, ...{
          exclude: [ /razzle-dev-utils\/webpackHotDevClient\.js/ ]
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
          include: [ /razzle-dev-utils\/webpackHotDevClient\.js/ ],
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
