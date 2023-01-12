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
}
