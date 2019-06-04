/* globals Package */
Package.describe({
  name: 'thisisnotacommercial:braintree',
  version: '0.0.1'
});

Package.onUse(api => {
  api.versionsFrom('1.8');
  api.use('ecmascript');
  api.use('unchained:core-logger@0.26.0');
  api.use('unchained:core-payment@0.27.0');

  api.mainModule('braintree.js', 'server');
});
