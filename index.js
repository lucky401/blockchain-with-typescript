"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
// Transfer of funds between two wallets
var Transaction = /** @class */ (function () {
    function Transaction(amount, payer, // public key
    payee // public key
    ) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    Transaction.prototype.toString = function () {
        return JSON.stringify(this);
    };
    return Transaction;
}());
// Individual block on the chain
// tslint:disable-next-line: max-classes-per-file
var Block = /** @class */ (function () {
    function Block(prevHash, // link to previous block
    transaction, ts) {
        if (ts === void 0) { ts = Date.now(); }
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.ts = ts;
        this.nonce = Math.round(Math.random() * 999999999);
    }
    Object.defineProperty(Block.prototype, "hash", {
        get: function () {
            var str = JSON.stringify(this);
            var hash = crypto_1.default.createHash('SHA256');
            hash.update(str).end();
            return hash.digest('hex');
        },
        enumerable: false,
        configurable: true
    });
    return Block;
}());
// The blockchain
// tslint:disable-next-line: max-classes-per-file
var Chain = /** @class */ (function () {
    function Chain() {
        this.chain = [
            // Genesis block
            new Block('', new Transaction(100, 'genesis', 'satoshi'))
        ];
    }
    Object.defineProperty(Chain.prototype, "lastBlock", {
        // Most recent block
        get: function () {
            return this.chain[this.chain.length - 1];
        },
        enumerable: false,
        configurable: true
    });
    // Proof of work system
    Chain.prototype.mine = function (nonce) {
        var solution = 1;
        // tslint:disable-next-line: no-console
        console.log('⛏️  mining...');
        while (true) {
            var hash = crypto_1.default.createHash('MD5');
            hash.update((nonce + solution).toString()).end();
            var attempt = hash.digest('hex');
            if (attempt.substr(0, 4) === '0000') {
                // tslint:disable-next-line: no-console
                console.log("Solved: " + solution);
                return solution;
            }
            solution += 1;
        }
    };
    // Add a new block to the chain if valid signature & proof of work is complete
    Chain.prototype.addBlock = function (transaction, senderPublicKey, signature) {
        var verify = crypto_1.default.createVerify('SHA256');
        verify.update(transaction.toString());
        var isValid = verify.verify(senderPublicKey, signature);
        if (isValid) {
            var newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.nonce);
            this.chain.push(newBlock);
        }
    };
    // Singleton instance
    Chain.instance = new Chain();
    return Chain;
}());
// Wallet gives a user a public/private keypair
// tslint:disable-next-line: max-classes-per-file
var Wallet = /** @class */ (function () {
    function Wallet() {
        var keypair = crypto_1.default.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }
    Wallet.prototype.sendMoney = function (amount, payeePublicKey) {
        var transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        var sign = crypto_1.default.createSign('SHA256');
        sign.update(transaction.toString()).end();
        var signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    };
    return Wallet;
}());
// Example usage
var satoshi = new Wallet();
var lucky = new Wallet();
satoshi.sendMoney(50, lucky.publicKey);
// tslint:disable-next-line: no-console
console.log(Chain.instance);
