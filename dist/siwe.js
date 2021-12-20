"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSIWESession = exports.siweAuthenticator = void 0;
var siwe_1 = require("siwe");
var rfc4648_1 = require("rfc4648");
var _1 = require(".");
var zcap_1 = require("./zcap");
var siweAuthenticator = function (client, domain, chainId, delegation) {
    if (chainId === void 0) { chainId = '1'; }
    return __awaiter(void 0, void 0, void 0, function () {
        var pkh, _a, h, delId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, client.getAddress()];
                case 1:
                    pkh = _b.sent();
                    _a = zcap_1.getHeaderAndDelId(delegation), h = _a.h, delId = _a.delId;
                    return [2 /*return*/, {
                            content: function (orbit, cids, action) { return __awaiter(void 0, void 0, void 0, function () {
                                var auth, signature, invstr;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            auth = createSiweAuthContentMessage(orbit, pkh, action, cids, domain, chainId);
                                            return [4 /*yield*/, client.signMessage(auth)];
                                        case 1:
                                            signature = _a.sent();
                                            invstr = rfc4648_1.base64url.stringify(new TextEncoder().encode(JSON.stringify([auth, signature])));
                                            return [2 /*return*/, __assign({ "X-Siwe-Invocation": invstr }, h)];
                                    }
                                });
                            }); },
                            createOrbit: function (cids, params) { return __awaiter(void 0, void 0, void 0, function () {
                                var _a, oid, auth, signature, invstr;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, createSiweAuthCreationMessage(pkh, cids, domain, params, chainId)];
                                        case 1:
                                            _a = _b.sent(), oid = _a.oid, auth = _a.auth;
                                            return [4 /*yield*/, client.signMessage(auth)];
                                        case 2:
                                            signature = _b.sent();
                                            invstr = rfc4648_1.base64url.stringify(new TextEncoder().encode(JSON.stringify([auth, signature])));
                                            return [2 /*return*/, { headers: { "X-Siwe-Invocation": invstr }, oid: oid }];
                                    }
                                });
                            }); }
                        }];
            }
        });
    });
};
exports.siweAuthenticator = siweAuthenticator;
var statement = "Authorize an action on your Kepler Orbit";
var version = "1";
var createSiweAuthContentMessage = function (orbit, address, action, cids, domain, chainId) {
    var now = Date.now();
    return new siwe_1.SiweMessage({
        domain: domain, address: address, statement: statement, version: version, chainId: chainId,
        issuedAt: new Date(now).toISOString(),
        expirationTime: new Date(now + 10000).toISOString(),
        resources: cids.map(function (cid) { return "kepler://" + orbit + "/" + cid + "#" + action.toLowerCase(); }),
        uri: "kepler://" + orbit
    }).toMessage();
};
var createSiweAuthCreationMessage = function (address, cids, domain, params, chainId) { return __awaiter(void 0, void 0, void 0, function () {
    var now, paramsStr, oid, auth;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                now = Date.now();
                paramsStr = _1.orbitParams(__assign({ did: "did:pkh:eip155:" + chainId + ":" + address, vm: "blockchainAccountId" }, params));
                return [4 /*yield*/, _1.getOrbitId("did", paramsStr)];
            case 1:
                oid = _a.sent();
                auth = new siwe_1.SiweMessage({
                    domain: domain, address: address, version: version, chainId: chainId,
                    statement: 'Authorize this provider to host your Orbit',
                    issuedAt: new Date(now).toISOString(),
                    expirationTime: new Date(now + 10000).toISOString(),
                    resources: __spreadArray(["kepler://" + oid + "#host"], cids.map(function (cid) { return "kepler://" + oid + "/" + cid + "#put"; })),
                    uri: "kepler://did" + paramsStr
                }).toMessage();
                return [2 /*return*/, { oid: oid, auth: auth }];
        }
    });
}); };
var millisecondsFromNow = function (ms) { return new Date(Date.now() + ms); };
var startSIWESession = function (orbit, domain, chainId, delegator, delegate, actions, opts) {
    if (actions === void 0) { actions = ['get']; }
    if (opts === void 0) { opts = { exp: millisecondsFromNow(120000) }; }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new siwe_1.SiweMessage(__assign(__assign({ domain: domain, address: delegator, statement: "Allow " + domain + " to access your orbit using their temporary session key: " + delegate, uri: delegate, resources: actions.map(function (action) { return "kepler://" + orbit + "#" + action; }), version: version,
                    chainId: chainId }, (opts.exp ? { expirationTime: opts.exp.toISOString() } : {})), (opts.nbf ? { notBefore: opts.nbf.toISOString() } : {})))];
        });
    });
};
exports.startSIWESession = startSIWESession;
