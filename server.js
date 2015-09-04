var web3 = require('web3');
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var getBlockRlp = require('./get_block_rlp.js');
var Q = require('q');
var eth_block = require('ethereumjs-block');
var eth_util = require('ethereumjs-util');

var filling = {};

var blockhashes = web3.eth.contract([{
    "name": "add_old(bytes,int256)",
    "type": "function",
    "inputs": [{ "name": "header", "type": "bytes" }, { "name": "n", "type": "int256" }],
    "outputs": []
},
{
    "name": "add_recent(int256)",
    "type": "function",
    "inputs": [{ "name": "n", "type": "int256" }],
    "outputs": []
},
{
    "name": "get_blockhash(int256)",
    "type": "function",
    "inputs": [{ "name": "n", "type": "int256" }],
    "outputs": []
},
{
    "name": "get_blockhash_from_storage(int256)",
    "type": "function",
    "inputs": [{ "name": "n", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "Error(bytes)",
    "type": "event",
    "inputs": [{ "name": "x", "type": "bytes", "indexed": false }]
}]);
var blockhashesInstance = blockhashes.at('0x5e67df9864b113b59a39fd19840772f41366dc4e');
var blockFilter = web3.eth.filter('latest');
blockFilter.watch(function (error, result) {
    if (error) {
        console.log(error);
        return;
    }

	var block = web3.eth.getBlock(result);
	fillInBlanks(block.number, block.number - 1, 100)
		.fail(function (err) {
			console.log(err);
		});
});

function fillInBlanks(headBlock, blockNumber, blocksBack) {
	var promise = Q();
	for (var i = 0; i < blocksBack; i++) {
		(function () {
			var local_i = i;
			promise = promise
				.then(function () {
					var currentBlockNumber = blockNumber - local_i;
					var existing = blockhashesInstance.get_blockhash_from_storage.call(currentBlockNumber);
					console.log('debug existing: ' + existing);
					if (existing == 0 && !filling[currentBlockNumber]) {
						filling[currentBlockNumber] = true;
						console.log('filling: ' + currentBlockNumber);
						if (headBlock - currentBlockNumber < 200) {
							var deferred = Q.defer();
							blockhashesInstance.add_recent(currentBlockNumber, {from:'0x8266c4a0e9301661f19c936b7bd16c0dfa37c6e6', gas:90000}, function (err, result) {
								if (err) {
									console.log(err);
									delete filling[currentBlockNumber];
									return deferred.reject(new Error(err));
								}

								delete filling[currentBlockNumber];
								console.log('adding block ' + currentBlockNumber);
								console.log('tx: ' + result);
								return deferred.resolve();
							});
							return deferred.promise;
						} else {
							try {
								var deferred = Q.defer();
								getBlockRlp(currentBlockNumber+1, function (err, rlp) {
									if (err) {
										delete filling[currentBlockNumber];
										return deferred.reject(new Error(err));
									}
									var block = new eth_block(new Buffer(rlp, 'hex'));
									var encoded = eth_util.rlp.encode(block.header.raw).toString('hex');
									console.log('adding old: ' + currentBlockNumber + '\nrlp: ' + encoded);
									try {
										var txid = blockhashesInstance.add_old('0x' + encoded, currentBlockNumber, {from:'0x8266c4a0e9301661f19c936b7bd16c0dfa37c6e6', gas:200000});
									} catch (e) {
										delete filling[currentBlockNumber];
										return deferred.reject(new Error(e));
									}
									console.log('tx: ' + txid);
									delete filling[currentBlockNumber];
									return deferred.resolve();
								});
								return deferred.promise;
							} catch (e) {
								console.log(e);
								delete filling[currentBlockNumber];
								throw new Error(e);
							}
						}
						
					} else {
						if (filling[currentBlockNumber]) {
							console.log('already filling: ' + currentBlockNumber);
						} else {
							console.log('existing: ' + currentBlockNumber);
						}
					}
				});
		})();
	}
	return promise;
}

blockhashesInstance.Error().watch(function (error, result) {
    if (error) {
        console.log(error);
        return;
    }
	console.log(result);

});
