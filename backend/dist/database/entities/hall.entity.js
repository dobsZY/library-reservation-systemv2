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
exports.Hall = void 0;
const typeorm_1 = require("typeorm");
const table_entity_1 = require("./table.entity");
let Hall = class Hall {
    id;
    name;
    floor;
    description;
    layoutWidth;
    layoutHeight;
    layoutBackgroundUrl;
    layoutConfig;
    centerLatitude;
    centerLongitude;
    allowedRadiusMeters;
    capacity;
    isActive;
    displayOrder;
    createdAt;
    updatedAt;
    tables;
};
exports.Hall = Hall;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Hall.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Hall.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Hall.prototype, "floor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Hall.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'layout_width' }),
    __metadata("design:type", Number)
], Hall.prototype, "layoutWidth", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'layout_height' }),
    __metadata("design:type", Number)
], Hall.prototype, "layoutHeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'layout_background_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], Hall.prototype, "layoutBackgroundUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'layout_config', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Hall.prototype, "layoutConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'center_latitude', type: 'decimal', precision: 10, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Hall.prototype, "centerLatitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'center_longitude', type: 'decimal', precision: 11, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Hall.prototype, "centerLongitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allowed_radius_meters', default: 50 }),
    __metadata("design:type", Number)
], Hall.prototype, "allowedRadiusMeters", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Hall.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Hall.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_order', default: 0 }),
    __metadata("design:type", Number)
], Hall.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Hall.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Hall.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => table_entity_1.Table, (table) => table.hall),
    __metadata("design:type", Array)
], Hall.prototype, "tables", void 0);
exports.Hall = Hall = __decorate([
    (0, typeorm_1.Entity)('halls')
], Hall);
//# sourceMappingURL=hall.entity.js.map