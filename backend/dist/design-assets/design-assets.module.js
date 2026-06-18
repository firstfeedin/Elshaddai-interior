"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignAssetsModule = void 0;
const common_1 = require("@nestjs/common");
const design_assets_controller_1 = require("./design-assets.controller");
const design_assets_service_1 = require("./design-assets.service");
let DesignAssetsModule = class DesignAssetsModule {
};
exports.DesignAssetsModule = DesignAssetsModule;
exports.DesignAssetsModule = DesignAssetsModule = __decorate([
    (0, common_1.Module)({ controllers: [design_assets_controller_1.DesignAssetsController], providers: [design_assets_service_1.DesignAssetsService] })
], DesignAssetsModule);
//# sourceMappingURL=design-assets.module.js.map