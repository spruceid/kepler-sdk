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
exports.Authenticator = exports.startSession = void 0;
var ssx_wasm_1 = require("@spruceid/ssx-wasm");
function startSession(wallet, config) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var address, _c, chainId, _d;
        var _this = this;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!((_a = config === null || config === void 0 ? void 0 : config.address) !== null && _a !== void 0)) return [3 /*break*/, 1];
                    _c = _a;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, wallet.getAddress()];
                case 2:
                    _c = (_e.sent());
                    _e.label = 3;
                case 3:
                    address = _c;
                    if (!((_b = config === null || config === void 0 ? void 0 : config.chainId) !== null && _b !== void 0)) return [3 /*break*/, 4];
                    _d = _b;
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, wallet.getChainId()];
                case 5:
                    _d = (_e.sent());
                    _e.label = 6;
                case 6:
                    chainId = _d;
                    return [2 /*return*/, Promise.resolve(ssx_wasm_1.initialized)
                            .then(function () {
                            var _a, _b, _c, _d, _e, _f;
                            return ({
                                address: address,
                                chainId: chainId,
                                domain: (_a = config === null || config === void 0 ? void 0 : config.domain) !== null && _a !== void 0 ? _a : window.location.hostname,
                                service: (_b = config === null || config === void 0 ? void 0 : config.service) !== null && _b !== void 0 ? _b : "kv",
                                issuedAt: (_c = config === null || config === void 0 ? void 0 : config.issuedAt) !== null && _c !== void 0 ? _c : new Date(Date.now()).toISOString(),
                                notBefore: config === null || config === void 0 ? void 0 : config.notBefore,
                                expirationTime: (_d = config === null || config === void 0 ? void 0 : config.expirationTime) !== null && _d !== void 0 ? _d : new Date(Date.now() + 1000 * 60 * 60).toISOString(),
                                actions: (_e = config === null || config === void 0 ? void 0 : config.actions) !== null && _e !== void 0 ? _e : ["put", "get", "list", "del", "metadata"],
                                orbitId: (_f = config === null || config === void 0 ? void 0 : config.orbitId) !== null && _f !== void 0 ? _f : ssx_wasm_1.kepler.makeOrbitId(address, chainId),
                            });
                        })
                            .then(JSON.stringify)
                            .then(ssx_wasm_1.kepler.prepareSession)
                            .then(JSON.parse)
                            .then(function (preparedSession) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            var _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _a = [__assign({}, preparedSession)];
                                        _b = {};
                                        return [4 /*yield*/, wallet.signMessage(preparedSession.siwe)];
                                    case 1: return [2 /*return*/, (__assign.apply(void 0, _a.concat([(_b.signature = _c.sent(), _b)])))];
                                }
                            });
                        }); })
                            .then(JSON.stringify)
                            .then(ssx_wasm_1.kepler.completeSessionSetup)
                            .then(JSON.parse)];
            }
        });
    });
}
exports.startSession = startSession;
var Authenticator = /** @class */ (function () {
    function Authenticator(session) {
        var _this = this;
        this.invocationHeaders = function (action, path) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, ssx_wasm_1.initialized
                        .then(function () { return ssx_wasm_1.kepler.invoke(_this.serializedSession, path, action); })
                        .then(JSON.parse)];
            });
        }); };
        this.getOrbitId = function () { return _this.orbitId; };
        this.serialise = function () { return _this.serializedSession; };
        this.orbitId = session.orbitId;
        this.serializedSession = JSON.stringify(session);
    }
    Authenticator.deserialise = function (serializedAuthenticator) {
        return new Authenticator(JSON.parse(serializedAuthenticator));
    };
    return Authenticator;
}());
exports.Authenticator = Authenticator;
