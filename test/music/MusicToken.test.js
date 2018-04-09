const MusicToken = artifacts.require("MusicToken");
const assertJump = function(error) {
  assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Invalid opcode error must be returned');
};

contract('MusicToken', function(accounts) {
  
});