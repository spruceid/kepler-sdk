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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orbitParams = exports.getOrbitId = exports.stringEncoder = exports.Orbit = exports.Kepler = exports.tezosAuthenticator = exports.Action = exports.ethAuthenticator = void 0;
var beacon_sdk_1 = require("@airgap/beacon-sdk");
var cross_fetch_1 = __importDefault(require("cross-fetch"));
var cids_1 = __importDefault(require("cids"));
var multihashing_async_1 = __importDefault(require("multihashing-async"));
var zcap_1 = require("./zcap");
Object.defineProperty(exports, "ethAuthenticator", { enumerable: true, get: function () { return zcap_1.ethAuthenticator; } });
var Action;
(function (Action) {
    Action["get"] = "GET";
    Action["put"] = "PUT";
    Action["delete"] = "DEL";
    Action["list"] = "LIST";
})(Action = exports.Action || (exports.Action = {}));
var tezosAuthenticator = function (client, domain) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, pk, pkh;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, client.getActiveAccount().then(function (acc) {
                    if (acc === undefined) {
                        throw new Error("No Active Account");
                    }
                    return acc;
                })];
            case 1:
                _a = _b.sent(), pk = _a.publicKey, pkh = _a.address;
                return [2 /*return*/, {
                        content: function (orbit, cids, action) { return __awaiter(void 0, void 0, void 0, function () {
                            var auth, signature;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        auth = createTzAuthContentMessage(orbit, pk, pkh, action, cids, domain);
                                        return [4 /*yield*/, client.requestSignPayload({
                                                signingType: beacon_sdk_1.SigningType.MICHELINE,
                                                payload: exports.stringEncoder(auth)
                                            })];
                                    case 1:
                                        signature = (_a.sent()).signature;
                                        return [2 /*return*/, auth + " " + signature];
                                }
                            });
                        }); },
                        createOrbit: function (cids) { return __awaiter(void 0, void 0, void 0, function () {
                            var auth, signature;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, createTzAuthCreationMessage(pk, pkh, cids, { address: pkh, domain: domain, index: 0 })];
                                    case 1:
                                        auth = _a.sent();
                                        return [4 /*yield*/, client.requestSignPayload({
                                                signingType: beacon_sdk_1.SigningType.MICHELINE,
                                                payload: exports.stringEncoder(auth)
                                            })];
                                    case 2:
                                        signature = (_a.sent()).signature;
                                        return [2 /*return*/, auth + " " + signature];
                                }
                            });
                        }); }
                    }];
        }
    });
}); };
exports.tezosAuthenticator = tezosAuthenticator;
var Kepler = /** @class */ (function () {
    function Kepler(url, auth) {
        this.url = url;
        this.auth = auth;
    }
    Kepler.prototype.resolve = function (keplerUri, authenticate) {
        if (authenticate === void 0) { authenticate = true; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, versionedOrbit, cid, orbit;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!keplerUri.startsWith("kepler://"))
                            throw new Error("Invalid Kepler URI");
                        _a = keplerUri.split("/").slice(-2), versionedOrbit = _a[0], cid = _a[1];
                        orbit = versionedOrbit.split(":").pop();
                        if (!orbit || !cid)
                            throw new Error("Invalid Kepler URI");
                        return [4 /*yield*/, this.get(orbit, cid, authenticate)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    Kepler.prototype.get = function (orbit, cid, authenticate) {
        if (authenticate === void 0) { authenticate = true; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.orbit(orbit).get(cid, authenticate)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // typed so that it takes at least 1 element
    Kepler.prototype.put = function (orbit, first) {
        var rest = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            rest[_i - 2] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (_a = this.orbit(orbit)).put.apply(_a, __spreadArray([first], rest))];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    Kepler.prototype.del = function (orbit, cid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.orbit(orbit).del(cid)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Kepler.prototype.list = function (orbit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.orbit(orbit).list()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Kepler.prototype.orbit = function (orbit) {
        return new Orbit(this.url, orbit, this.auth);
    };
    Kepler.prototype.createOrbit = function (first) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, _b, _c, _d;
            var _e;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _b = (_a = this.auth).createOrbit;
                        return [4 /*yield*/, Promise.all(__spreadArray([first], rest).map(function (c) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, makeCid(c)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); }))];
                    case 1: return [4 /*yield*/, _b.apply(_a, [_f.sent()])];
                    case 2:
                        auth = _f.sent();
                        if (!(rest.length >= 1)) return [3 /*break*/, 5];
                        _c = cross_fetch_1.default;
                        _d = [this.url];
                        _e = {
                            method: 'POST'
                        };
                        return [4 /*yield*/, makeFormRequest.apply(void 0, __spreadArray([first], rest))];
                    case 3: return [4 /*yield*/, _c.apply(void 0, _d.concat([(_e.body = _f.sent(),
                                _e.headers = { 'Authorization': auth },
                                _e)]))];
                    case 4: return [2 /*return*/, _f.sent()];
                    case 5: return [4 /*yield*/, cross_fetch_1.default(this.url, {
                            method: 'POST',
                            body: JSON.stringify(first),
                            headers: {
                                'Authorization': auth,
                                'Content-Type': 'application/json'
                            }
                        })];
                    case 6: return [2 /*return*/, _f.sent()];
                }
            });
        });
    };
    return Kepler;
}());
exports.Kepler = Kepler;
var Orbit = /** @class */ (function () {
    function Orbit(url, orbitId, auth) {
        this.url = url;
        this.orbitId = orbitId;
        this.auth = auth;
    }
    Object.defineProperty(Orbit.prototype, "orbit", {
        get: function () {
            return this.orbitId;
        },
        enumerable: false,
        configurable: true
    });
    Orbit.prototype.get = function (cid, authenticate) {
        if (authenticate === void 0) { authenticate = true; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d;
            var _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _a = cross_fetch_1.default;
                        _b = [makeContentPath(this.url, this.orbit, cid)];
                        _e = {
                            method: "GET"
                        };
                        if (!authenticate) return [3 /*break*/, 2];
                        _f = {};
                        _d = "Authorization";
                        return [4 /*yield*/, this.auth.content(this.orbit, [cid], Action.get)];
                    case 1:
                        _c = (_f[_d] = _g.sent(), _f);
                        return [3 /*break*/, 3];
                    case 2:
                        _c = undefined;
                        _g.label = 3;
                    case 3: return [4 /*yield*/, _a.apply(void 0, _b.concat([(_e.headers = _c,
                                _e)]))];
                    case 4: return [2 /*return*/, _g.sent()];
                }
            });
        });
    };
    Orbit.prototype.put = function (first) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, _b, _c, _d, _e;
            var _f;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _b = (_a = this.auth).content;
                        _c = [this.orbit];
                        return [4 /*yield*/, Promise.all(__spreadArray([first], rest).map(function (c) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, makeCid(c)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); }))];
                    case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_g.sent(), Action.put]))];
                    case 2:
                        auth = _g.sent();
                        if (!(rest.length >= 1)) return [3 /*break*/, 5];
                        _d = cross_fetch_1.default;
                        _e = [makeOrbitPath(this.url, this.orbit)];
                        _f = {
                            method: "POST"
                        };
                        return [4 /*yield*/, makeFormRequest.apply(void 0, __spreadArray([first], rest))];
                    case 3: return [4 /*yield*/, _d.apply(void 0, _e.concat([(
                            // @ts-ignore
                            _f.body = _g.sent(),
                                _f.headers = { "Authorization": auth },
                                _f)]))];
                    case 4: return [2 /*return*/, _g.sent()];
                    case 5: return [4 /*yield*/, cross_fetch_1.default(makeOrbitPath(this.url, this.orbit), {
                            method: "POST",
                            body: JSON.stringify(first),
                            headers: {
                                "Authorization": auth,
                                "Content-Type": "application/json"
                            }
                        })];
                    case 6: return [2 /*return*/, _g.sent()];
                }
            });
        });
    };
    Orbit.prototype.del = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = cross_fetch_1.default;
                        _b = [makeContentPath(this.url, this.orbit, cid)];
                        _d = {
                            method: 'DELETE'
                        };
                        _e = {};
                        _c = 'Authorization';
                        return [4 /*yield*/, this.auth.content(this.orbit, [cid], Action.delete)];
                    case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([(_d.headers = (_e[_c] = _f.sent(), _e),
                                _d)]))];
                    case 2: return [2 /*return*/, _f.sent()];
                }
            });
        });
    };
    Orbit.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = cross_fetch_1.default;
                        _b = [makeOrbitPath(this.url, this.orbit)];
                        _d = { method: 'GET' };
                        _e = {};
                        _c = 'Authorization';
                        return [4 /*yield*/, this.auth.content(this.orbit, [], Action.list)];
                    case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([(_d.headers = (_e[_c] = _f.sent(), _e), _d)]))];
                    case 2: return [2 /*return*/, _f.sent()];
                }
            });
        });
    };
    return Orbit;
}());
exports.Orbit = Orbit;
var stringEncoder = function (s) {
    var bytes = Buffer.from(s, 'utf8');
    return "0501" + toPaddedHex(bytes.length) + bytes.toString('hex');
};
exports.stringEncoder = stringEncoder;
var addContent = function (form, content) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = form).append;
                return [4 /*yield*/, makeCid(content)];
            case 1:
                _b.apply(_a, [_c.sent(), new Blob([JSON.stringify(content)], { type: 'application/json' })]);
                return [2 /*return*/];
        }
    });
}); };
var makeCid = function (content, codec) {
    if (codec === void 0) { codec = 'json'; }
    return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = cids_1.default.bind;
                _b = [void 0, 1, codec];
                return [4 /*yield*/, multihashing_async_1.default(new TextEncoder().encode(typeof content === 'string' ? content : JSON.stringify(content)), 'blake2b-256')];
            case 1: return [2 /*return*/, new (_a.apply(cids_1.default, _b.concat([_c.sent()])))().toString('base58btc')];
        }
    }); });
};
var toPaddedHex = function (n, padLen, padChar) {
    if (padLen === void 0) { padLen = 8; }
    if (padChar === void 0) { padChar = '0'; }
    return n.toString(16).padStart(padLen, padChar);
};
var getOrbitId = function (type_, pkh, params) {
    if (params === void 0) { params = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeCid("" + type_ + exports.orbitParams(__assign({ address: pkh }, params)), 'raw')];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.getOrbitId = getOrbitId;
var orbitParams = function (params) {
    var p = [];
    for (var _i = 0, _a = Object.entries(params); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        p.push(key + "=" + (typeof value === 'string' ? value : value.toString()));
    }
    p.sort();
    return ';' + p.join(';');
};
exports.orbitParams = orbitParams;
var createTzAuthContentMessage = function (orbit, pk, pkh, action, cids, domain) {
    return "Tezos Signed Message: " + domain + " " + (new Date()).toISOString() + " " + pk + " " + pkh + " " + orbit + " " + action + " " + cids.join(' ');
};
var createEthAuthContentMessage = function (orbit, pkh, action, cids, domain) {
    return domain + " " + (new Date()).toISOString() + " " + pkh + " " + orbit + " " + action + " " + cids.join(' ');
};
var createTzAuthCreationMessage = function (pk, pkh, cids, params) { return __awaiter(void 0, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
    switch (_b.label) {
        case 0:
            _a = "Tezos Signed Message: " + params.domain + " " + (new Date()).toISOString() + " " + pk + " " + pkh + " ";
            return [4 /*yield*/, exports.getOrbitId("tz", pkh, params)];
        case 1: return [2 /*return*/, _a + (_b.sent()) + " CREATE tz" + exports.orbitParams(params) + " " + cids.join(' ')];
    }
}); }); };
var createEthAuthCreationMessage = function (pkh, cids, params) { return __awaiter(void 0, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
    switch (_b.label) {
        case 0:
            _a = params.domain + " " + (new Date()).toISOString() + " " + pkh + " ";
            return [4 /*yield*/, exports.getOrbitId("eth", pkh, params)];
        case 1: return [2 /*return*/, _a + (_b.sent()) + " CREATE eth" + exports.orbitParams(params) + " " + cids.join(' ')];
    }
}); }); };
var makeOrbitPath = function (url, orbit) { return url + "/" + orbit; };
var makeContentPath = function (url, orbit, cid) { return makeOrbitPath(url, orbit) + "/" + cid; };
var makeFormRequest = function (first) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var data, _a, rest_1, content;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    data = new FormData();
                    return [4 /*yield*/, addContent(data, first)];
                case 1:
                    _b.sent();
                    _a = 0, rest_1 = rest;
                    _b.label = 2;
                case 2:
                    if (!(_a < rest_1.length)) return [3 /*break*/, 5];
                    content = rest_1[_a];
                    return [4 /*yield*/, addContent(data, content)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _a++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, data];
            }
        });
    });
};
