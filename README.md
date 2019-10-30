[![npm version](https://badge.fury.io/js/razzle-plugin-proxy.svg)](https://badge.fury.io/js/razzle-plugin-proxy)

# razzle-plugin-proxy
This package contains a plugin to run the webpack devserver behind a reverse proxy

Usage in Razzle Projects
```sh
yarn add razzle-plugin-proxy --dev
```

create a **razzle.config.js** file in root directory of project (next to the *package.json*) and put this content inside it

Using the plugin

Set `CLIENT_PUBLIC_PATH=https://www.example.com/app1/webpack` and proxy port 3001 to the backend.


```javascript
// razzle.config.js

module.exports = {
  plugins: ['proxy'],
};
```

Example:

```nginx

server {
     listen 443;
     server_name www.example.com;
     location /app1/webpack {
         proxy_pass http://0.0.0.0:3001/;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_cache_bypass $http_upgrade;
      }     

      
     location /app1 {
         proxy_pass http://0.0.0.0:3000/;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_cache_bypass $http_upgrade;
      }     
 }

```
Run:

yarn start