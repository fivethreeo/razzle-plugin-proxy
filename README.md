# DEPRECATED

Razzle can easily be customized to work this way now. See [with-single-exposed-port](https://github.com/jaredpalmer/razzle/tree/next/examples/with-single-exposed-port) and
[with-custom-devserver-options](https://github.com/jaredpalmer/razzle/tree/next/examples/with-custom-devserver-options)

# razzle-plugin-proxy
This package contains a plugin to run the webpack devserver behind a reverse proxy

Usage in Razzle Projects
```sh
yarn add razzle-plugin-proxy --dev
```

create a **razzle.config.js** file in root directory of project (next to the *package.json*) and put this content inside it

Using the plugin

Set `CLIENT_PUBLIC_PATH=https://www.example.com/razzle/webpack/` and proxy frontend `/razzle/`, `/razzle/webpack/` to the backend ports 3000 and 3001 respectively.


```javascript
// razzle.config.js

module.exports = {
  plugins: ['proxy'],
};
```

Example:

```bash

sudo npm install -g npx

create-razzle-app testrazzle
cd testrazzle

yarn add razzle-plugin-proxy

echo PUBLIC_PATH=https://razzle.hongri.no/testrazzle/ > .env

echo CLIENT_PUBLIC_PATH=https://razzle.hongri.no/testrazzle/webpack/ >> .env

export CERTS_VOLUME=nginx_certs
export VHOST_D_VOLUME=nginx_vhost_d
export HTML_VOLUME=nginx_html
export LETSENCRYPT_DEFAULT_EMAIL=email@example.com
export VIRTUAL_HOST=razzle.hongri.no


cat << EOF > razzle.config.js
'use strict';

module.exports = {
  plugins: [ 'proxy' ]
};
EOF


cat << EOF > default.conf
server {
  listen 80;
  server_name ${VIRTUAL_HOST};

  location /testrazzle/webpack/ {
    proxy_pass http://10.0.0.1:3001/webpack/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
  }     


  location /testrazzle/webpack/static/ {
    proxy_pass http://10.0.0.1:3001/static/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
  }     

  location /testrazzle/ {
    proxy_pass http://10.0.0.1:3000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
  }     
}
EOF

cat << EOF > docker-compose.yml
version: "3.7"

services:
  nginx:
    image: nginx:alpine
    ports:
     - "80:80"
    volumes:
      - ./default.conf:/etc/nginx/conf.d/default.conf
    networks:
      - dockernet
    environment:
      VIRTUAL_HOST: ${VIRTUAL_HOST}
      LETSENCRYPT_HOST: ${VIRTUAL_HOST}

EOF

cat << EOF > docker-compose.proxy.yml
version: "3.7"

services:
  nginx-proxy:
    image: jwilder/nginx-proxy
    ports:
     - "80:80"
     - "443:443"
    volumes:
      - certs:/etc/nginx/certs:ro
      - vhost_d:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
      - /var/run/docker.sock:/tmp/docker.sock:ro
    labels:
      - com.github.jrcs.letsencrypt_nginx_proxy_companion.nginx_proxy


  nginx-proxy-letsencrypt:
    image: jrcs/letsencrypt-nginx-proxy-companion
    volumes:
      - certs:/etc/nginx/certs
      - vhost_d:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      DEFAULT_EMAIL: ${LETSENCRYPT_DEFAULT_EMAIL}

volumes:
  certs:
    external:
      name: ${CERTS_VOLUME}
  vhost_d:
    external:
      name: ${VHOST_D_VOLUME}
  html:
    external:
      name: ${HTML_VOLUME}

EOF

docker volume create ${CERTS_VOLUME}
docker volume create ${VHOST_D_VOLUME}
docker volume create ${HTML_VOLUME}

sudo docker-compose -f docker-compose.yml up -d

sudo docker-compose -f docker-compose.proxy.yml up -d

```

change

```jsx
<Route exact path="/" component={Home} />
```
to

```jsx
<Route exact path="/testrazzle/" component={Home} />
```
in App.js

Add

```html
  <link rel="shortcut icon" href="/testrazzle/static/favicon.ico">
```

To server.js

Run:

yarn start
