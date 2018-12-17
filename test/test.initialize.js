const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');

chai.use(chaiAsPromised);
chai.use(sinonChai);

// Test Globals
expect = chai.expect;
sinon = require('sinon');

const init = function() {
  return Promise.resolve(true);
};

process.on('unhandledRejection', (err, p) => {
  console.error('Unhandled promise rejection: ' + err);
  console.error(err.stack);
});

process.on('uncaughtException', function(err) {
  console.error('Unhandled Execption: ' + err.message);
  console.error(err.stack);
});

init().then(function() {
  run();
});
