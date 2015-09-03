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
var blockhashesInstance = blockhashes.at('0x');
var blockFilter = web3.eth.filter('latest');
blockFilter.watch(function (error, result) {
    if (error) {
        console.log(error);
        return;
    }
    blockhashesInstance.add_recent(1);
});

