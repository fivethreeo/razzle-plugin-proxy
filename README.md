[![npm version](https://badge.fury.io/js/razzle-plugin-proxy.svg)](https://badge.fury.io/js/razzle-plugin-proxy)

# razzle-plugin-proxy
This package contains a plugin to run the webpack devserver behind a reverse proxy

Usage in Razzle Projects
```sh
yarn add razzle-plugin-proxy --dev
```

create a **razzle.config.js** file in root directory of project (next to the *package.json*) and put this content inside it

Using the plugin

Set ```bash CLIENT_PUBLIC_PATH=https://www.example.com/webpack``` and proxy port 3001 to the backend.


```javascript
// razzle.config.js

module.exports = {
  plugins: ['proxy'],
};
```