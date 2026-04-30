"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenCatalogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const screen_catalog_1 = require("../../common/dashboard/screen-catalog");
let ScreenCatalogController = class ScreenCatalogController {
    findAll() {
        const modules = screen_catalog_1.SCREEN_CATALOG.reduce((acc, screen) => {
            acc[screen.module] = acc[screen.module] || [];
            acc[screen.module].push(screen);
            return acc;
        }, {});
        return { totalScreens: screen_catalog_1.SCREEN_CATALOG.length, modules };
    }
};
exports.ScreenCatalogController = ScreenCatalogController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Frontend screen catalog: 6 modules and 41 HTML dashboard screens' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ScreenCatalogController.prototype, "findAll", null);
exports.ScreenCatalogController = ScreenCatalogController = __decorate([
    (0, swagger_1.ApiTags)('Screen Catalog'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/screens')
], ScreenCatalogController);
//# sourceMappingURL=screen-catalog.controller.js.map