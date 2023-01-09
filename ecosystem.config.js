module.exports = {
  apps: [
    {
      name: 'milinus-api',
      script: 'dist/main.js',
      instances: '1',
      exec_mode: 'cluster',
      pmx: false,
      error_file: '~/logs/milinus-api-error.log',
      out_file: '~/logs/milinus-api-out.log',
    },
    {
      name: 'milinus-api-replica',
      script: 'dist/main.js',
      instances: '1',
      exec_mode: 'cluster',
      pmx: false,
      error_file: '~/logs/milinus-api-error.log',
      out_file: '~/logs/milinus-api-out.log',
    },
  ],
  deploy: {
    testing: {
      user: 'ubuntu',
      host: '35.180.122.63',
      ref: 'origin/testing',
      repo: 'git@gitlab.com:totem-paris/milinus-api.git',
      path: '/home/ubuntu/milinus-api',
      'post-setup': 'cp -f env/testing .env && yarn && yarn post-setup',
      'post-deploy':
        'cp -f env/testing .env && yarn && yarn post-setup && yarn test:e2e && yarn start:testing',
    },
    staging: {
      user: 'ubuntu',
      host: '15.236.38.141',
      ref: 'origin/staging',
      repo: 'git@gitlab.com:totem-paris/milinus-api.git',
      path: '/home/ubuntu/milinus-api',
      'post-setup': 'cp -f env/staging .env && yarn && yarn post-setup',
      'post-deploy':
        'cp -f env/staging .env && yarn && yarn post-setup && yarn test:e2e && yarn start:testing',
    },
    production: {
      user: 'ubuntu',
      host: '13.36.204.110',
      ref: 'origin/master',
      repo: 'git@gitlab.com:totem-paris/milinus-api.git',
      path: '/home/ubuntu/milinus-api',
      'post-setup': 'cp -f env/production .env && yarn && yarn post-setup',
      'post-deploy':
        'cp -f env/production .env && yarn && yarn post-setup && yarn test:e2e && yarn start:production',
    },
  },
}
