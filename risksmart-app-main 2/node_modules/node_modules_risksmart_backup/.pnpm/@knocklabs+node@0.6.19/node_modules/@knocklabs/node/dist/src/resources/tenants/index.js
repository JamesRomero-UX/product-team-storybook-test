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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tenants = void 0;
class Tenants {
    constructor(knock) {
        this.knock = knock;
    }
    list(filteringOptions = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.knock.get("/v1/tenants", filteringOptions);
            return data;
        });
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.knock.get(`/v1/tenants/${id}`);
            return data;
        });
    }
    set(id, tenantData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.knock.put(`/v1/tenants/${id}`, tenantData);
            return data;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.knock.delete(`/v1/tenants/${id}`);
            return data;
        });
    }
}
exports.Tenants = Tenants;
