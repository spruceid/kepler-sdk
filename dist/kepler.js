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
exports.invoke = exports.Kepler = void 0;
var authenticator_1 = require("./authenticator");
var orbit_1 = require("./orbit");
/** An object for interacting with Kepler instances. */
var Kepler = /** @class */ (function () {
    /**
     * @param wallet The controller of the orbit that you wish to access.
     * @param config Optional configuration for Kepler.
     */
    function Kepler(wallet, config) {
        this.config = {
            hosts: config.hosts,
        };
        this.wallet = wallet;
    }
    /** Make a connection to an orbit.
     *
     * This method handles the creation and connection to an orbit in Kepler. This method should
     * usually be used without providing any ConnectionOptions:
     * ```ts
     * let orbitConnection = await kepler.orbit();
     * ```
     * In this case the orbit ID will be derived from the wallet's address. The wallet will be
     * asked to sign a message delegating access to a session key for 1 hour. If the orbit does not
     * already exist in the Kepler instance, then the wallet will be asked to sign another message
     * to permit the Kepler instance to host the orbit.
     *
     * @param config Optional parameters to configure the orbit connection.
     * @returns Returns undefined if the Kepler instance was unable to host the orbit.
     */
    Kepler.prototype.orbit = function (config) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var keplerUrl, orbitConnection;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keplerUrl = this.config.hosts[0];
                        return [4 /*yield*/, authenticator_1.startSession(this.wallet, config)
                                .then(function (session) { return new authenticator_1.Authenticator(session); })
                                .then(function (authn) { return new orbit_1.OrbitConnection(keplerUrl, authn); })];
                    case 1:
                        orbitConnection = _a.sent();
                        return [4 /*yield*/, orbitConnection.list().then(function (_a) {
                                var status = _a.status;
                                return __awaiter(_this, void 0, void 0, function () {
                                    var ok;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                if (!(status === 404)) return [3 /*break*/, 2];
                                                console.info("Orbit does not already exist. Creating...");
                                                return [4 /*yield*/, orbit_1.hostOrbit(this.wallet, keplerUrl, orbitConnection.id(), config.domain)];
                                            case 1:
                                                ok = (_b.sent()).ok;
                                                return [2 /*return*/, ok ? orbitConnection : undefined];
                                            case 2: return [2 /*return*/, orbitConnection];
                                        }
                                    });
                                });
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Kepler;
}());
exports.Kepler = Kepler;
var invoke = function (url, params) { return fetch(url + "/invoke", __assign({ method: "POST" }, params)); };
exports.invoke = invoke;
