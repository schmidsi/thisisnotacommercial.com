/* globals Package */
Package.describe({
  name: 'thisisnotacommercial:pricing',
  version: '0.0.1'
});

Package.onUse(api => {
  api.versionsFrom('1.8');
  api.use('ecmascript');
  api.use('unchained:core-logger@0.26.0');

  api.mainModule('pricing.js', 'server');
});
