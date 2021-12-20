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
Object.defineProperty(exports, "__esModule", { value: true });
exports.keplerContext = exports.sessionProps = exports.didVmToParams = exports.startSession = exports.zcapAuthenticator = exports.getHeaderAndDelId = void 0;
var _1 = require(".");
var rfc4648_1 = require("rfc4648");
var zcap_providers_1 = require("@spruceid/zcap-providers");
var siwe_1 = require("siwe");
var getHeaderAndDelId = function (delegation) { return delegation instanceof siwe_1.SiweMessage ? {
    h: { "X-Siwe-Delegation": rfc4648_1.base64url.stringify(new TextEncoder().encode(JSON.stringify([delegation.toMessage(), delegation.signature]))) },
    delId: "urn:siwe:kepler:" + delegation.nonce
} : delegation ? {
    h: { "X-Kepler-Delegation": rfc4648_1.base64url.stringify(new TextEncoder().encode(JSON.stringify(delegation))) },
    delId: delegation.id
} : { h: {}, delId: "" }; };
exports.getHeaderAndDelId = getHeaderAndDelId;
var zcapAuthenticator = function (client, delegation) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, h, delId;
    return __generator(this, function (_b) {
        _a = exports.getHeaderAndDelId(delegation), h = _a.h, delId = _a.delId;
        return [2 /*return*/, {
                content: function (orbit, cids, action) { return __awaiter(void 0, void 0, void 0, function () {
                    var props, inv, invstr;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                props = invProps(orbit, actionToKey(action, cids));
                                return [4 /*yield*/, client.invoke(props, delId || ("kepler://" + orbit), zcap_providers_1.randomId(), exports.keplerContext)];
                            case 1:
                                inv = _a.sent();
                                invstr = rfc4648_1.base64url.stringify(new TextEncoder().encode(JSON.stringify(inv)));
                                return [2 /*return*/, __assign({ "X-Kepler-Invocation": invstr }, h)];
                        }
                    });
                }); },
                createOrbit: function (cids, params, method) {
                    if (params === void 0) { params = {}; }
                    if (method === void 0) { method = 'did'; }
                    return __awaiter(void 0, void 0, void 0, function () {
                        var parameters, oid, props, inv, invBytes;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    parameters = exports.didVmToParams(client.id(), params);
                                    return [4 /*yield*/, _1.makeCid(new TextEncoder().encode(parameters))];
                                case 1:
                                    oid = _a.sent();
                                    props = invProps(oid, {
                                        create: {
                                            parameters: parameters, content: cids
                                        }
                                    });
                                    return [4 /*yield*/, client.invoke(props, "kepler://" + oid, zcap_providers_1.randomId(), exports.keplerContext)];
                                case 2:
                                    inv = _a.sent();
                                    invBytes = new TextEncoder().encode(JSON.stringify(inv));
                                    return [2 /*return*/, { headers: { "X-Kepler-Invocation": rfc4648_1.base64url.stringify(invBytes) }, oid: oid }];
                            }
                        });
                    });
                }
            }];
    });
}); };
exports.zcapAuthenticator = zcapAuthenticator;
var startSession = function (orbit, controller, sessionKey, rights, timeMs) {
    if (rights === void 0) { rights = ['list', 'get']; }
    if (timeMs === void 0) { timeMs = 1000 * 60; }
    return __awaiter(void 0, void 0, void 0, function () {
        var exp, delegation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    exp = new Date(Date.now() + timeMs);
                    return [4 /*yield*/, controller.delegate(exports.sessionProps("kepler://" + orbit, sessionKey.id(), rights, exp), [], zcap_providers_1.randomId(), exports.keplerContext)
                        // return authenticator for client
                    ];
                case 1:
                    delegation = _a.sent();
                    return [4 /*yield*/, exports.zcapAuthenticator(sessionKey, delegation)];
                case 2: 
                // return authenticator for client
                return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.startSession = startSession;
var didVmToParams = function (didVm, other) {
    if (other === void 0) { other = {}; }
    var _a = didVm.split("#"), did = _a[0], vm = _a[1];
    return "did" + _1.orbitParams(__assign(__assign({}, other), { did: did, vm: vm }));
};
exports.didVmToParams = didVmToParams;
var sessionProps = function (parentCapability, invoker, capabilityAction, expiration) {
    if (capabilityAction === void 0) { capabilityAction = ['list', 'get']; }
    return ({
        parentCapability: parentCapability, invoker: invoker, capabilityAction: capabilityAction, expiration: expiration.toISOString()
    });
};
exports.sessionProps = sessionProps;
var ContentActionKeys;
(function (ContentActionKeys) {
    ContentActionKeys["get"] = "get";
    ContentActionKeys["put"] = "put";
    ContentActionKeys["del"] = "del";
})(ContentActionKeys || (ContentActionKeys = {}));
var actionToKey = function (action, cids) {
    var _a, _b, _c;
    switch (action) {
        case _1.Action.get:
            return _a = {}, _a[ContentActionKeys.get] = cids, _a;
        case _1.Action.put:
            return _b = {}, _b[ContentActionKeys.put] = cids, _b;
        case _1.Action.delete:
            return _c = {}, _c[ContentActionKeys.del] = cids, _c;
        case _1.Action.list:
            return 'list';
    }
};
var invProps = function (orbit, capabilityAction) {
    if (capabilityAction === void 0) { capabilityAction = 'list'; }
    return ({
        invocationTarget: orbit,
        capabilityAction: capabilityAction
    });
};
exports.keplerContext = [zcap_providers_1.W3ID_SECURITY_V2, { capabilityAction: { "@id": "sec:capabilityAction", "@type": "@json" } }];
