var web3 = require('web3');
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
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
        "name": "Error(bytes)",
            "type": "event",
                "inputs": [{ "name": "x", "type": "bytes", "indexed": false }]
}]
);
var blockhashesInstance = blockhashes.at('0x84cb2fd6f7b123acc0762ba4a8e1e3987cba125d');
blockhashesInstance.get_blockhash.call(179340, function (err, res) {
	console.log(err)
	console.log(res)
});

