"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ethAuthenticator = void 0;
var ethAuthenticator = function (client, domain, prepareInvokeCapability, completeInvokeCapability) { return __awaiter(void 0, void 0, void 0, function () {
    var accounts, pkh, prepareInvocation, completeInvocation;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.request({ method: 'eth_accounts' })];
            case 1:
                accounts = _a.sent();
                if (accounts.length === 0) {
                    throw new Error("No Active Account");
                }
                pkh = accounts[0];
                prepareInvocation = function (target_id, invProps, sigOpts, pk) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _b = (_a = JSON).parse;
                            return [4 /*yield*/, prepareInvokeCapability(JSON.stringify(invProps), target_id, JSON.stringify(sigOpts), JSON.stringify(pk))];
                        case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                    }
                }); }); };
                completeInvocation = function (invProps, preperation, signature) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _b = (_a = JSON).parse;
                            return [4 /*yield*/, completeInvokeCapability(JSON.stringify(invProps), JSON.stringify(preperation), signature)];
                        case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                    }
                }); }); };
                return [2 /*return*/, {
                        content: function (orbit, cids, action) { return __awaiter(void 0, void 0, void 0, function () {
                            var inv, prep, signature, _a, _b, _c;
                            var _d;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        inv = invProps(action);
                                        return [4 /*yield*/, prepareInvocation("kepler://" + orbit + "/read", inv, sigProps("did:pkh:eth:" + pkh), keyProps)];
                                    case 1:
                                        prep = _e.sent();
                                        if (!prep || prep.signingInput === undefined || prep.signingInput.primaryType === undefined) {
                                            console.log("Proof preparation:", prep);
                                            throw new Error("Expected EIP-712 TypedData");
                                        }
                                        return [4 /*yield*/, client.request({
                                                method: 'eth_signTypedData_v4',
                                                params: [pkh, JSON.stringify(prep.signingInput)],
                                            })];
                                    case 2:
                                        signature = _e.sent();
                                        _d = {};
                                        _a = "Invocation";
                                        _c = (_b = JSON).stringify;
                                        return [4 /*yield*/, completeInvocation(inv, prep, signature)];
                                    case 3: return [2 /*return*/, (_d[_a] = _c.apply(_b, [_e.sent()]), _d)];
                                }
                            });
                        }); },
                        createOrbit: function (cids) { return __awaiter(void 0, void 0, void 0, function () {
                            var inv, prep, signature, _a, _b, _c;
                            var _d;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        inv = invProps('Create');
                                        return [4 /*yield*/, prepareInvocation("orbit_id", inv, sigProps("did:pkh:eth:" + pkh), keyProps)];
                                    case 1:
                                        prep = _e.sent();
                                        if (!prep || prep.signingInput === undefined || prep.signingInput.primaryType === undefined) {
                                            console.log("Proof preparation:", prep);
                                            throw new Error("Expected EIP-712 TypedData");
                                        }
                                        return [4 /*yield*/, client.request({
                                                method: 'eth_signTypedData_v4',
                                                params: [pkh, JSON.stringify(prep.signingInput)],
                                            })];
                                    case 2:
                                        signature = _e.sent();
                                        _d = {};
                                        _a = "Invocation";
                                        _c = (_b = JSON).stringify;
                                        return [4 /*yield*/, completeInvocation(inv, prep, signature)];
                                    case 3: return [2 /*return*/, (_d[_a] = _c.apply(_b, [_e.sent()]), _d)];
                                }
                            });
                        }); }
                    }];
        }
    });
}); };
exports.ethAuthenticator = ethAuthenticator;
var keyProps = { "kty": "EC", "crv": "secp256k1", "alg": "ES256K-R", "key_ops": ["signTypedData"] };
var invProps = function (capabilityAction) {
    if (capabilityAction === void 0) { capabilityAction = 'Read'; }
    return ({
        "@context": "https://w3id.org/security/v2",
        id: "urn:uuid:helo",
        capabilityAction: capabilityAction
    });
};
var sigProps = function (did) { return ({
    // type: "EthereumEip712Signature2021",
    verificationMethod: did + '#Recovery2020',
    proofPurpose: 'assertionMethod',
    eip712Domain: {
        primaryType: "CapabilityInvocation",
        domain: {
            "name": "EthereumEip712Signature2021"
        },
        messageSchema: {
            "EIP712Domain": [
                { "name": "name", "type": "string" }
            ],
            "CapabilityInvocation": [
                { "name": "@context", "type": "string" },
                { "name": "id", "type": "string" },
                { "name": "capabilityAction", "type": "string" },
                { "name": "proof", "type": "Proof" }
            ],
            "Proof": [
                { "name": "@context", "type": "string" },
                { "name": "verificationMethod", "type": "string" },
                { "name": "created", "type": "string" },
                // { "name": "capability", "type": "string" },
                { "name": "proofPurpose", "type": "string" },
                { "name": "type", "type": "string" }
            ]
        }
    }
}); };
