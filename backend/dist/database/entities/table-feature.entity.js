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
exports.TableFeature = void 0;
const typeorm_1 = require("typeorm");
const table_entity_1 = require("./table.entity");
let TableFeature = class TableFeature {
    id;
    code;
    name;
    icon;
    description;
    displayOrder;
    isActive;
    createdAt;
    tables;
};
exports.TableFeature = TableFeature;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TableFeature.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, unique: true }),
    __metadata("design:type", String)
], TableFeature.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], TableFeature.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], TableFeature.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TableFeature.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_order', default: 0 }),
    __metadata("design:type", Number)
], TableFeature.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], TableFeature.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TableFeature.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => table_entity_1.Table, (table) => table.features),
    __metadata("design:type", Array)
], TableFeature.prototype, "tables", void 0);
exports.TableFeature = TableFeature = __decorate([
    (0, typeorm_1.Entity)('table_features')
], TableFeature);
//# sourceMappingURL=table-feature.entity.js.map