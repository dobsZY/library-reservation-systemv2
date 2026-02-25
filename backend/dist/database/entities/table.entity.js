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
exports.Table = exports.TableStatus = void 0;
const typeorm_1 = require("typeorm");
const hall_entity_1 = require("./hall.entity");
const table_feature_entity_1 = require("./table-feature.entity");
const reservation_entity_1 = require("./reservation.entity");
var TableStatus;
(function (TableStatus) {
    TableStatus["AVAILABLE"] = "available";
    TableStatus["MAINTENANCE"] = "maintenance";
    TableStatus["RESERVED"] = "reserved";
})(TableStatus || (exports.TableStatus = TableStatus = {}));
let Table = class Table {
    id;
    hallId;
    tableNumber;
    positionX;
    positionY;
    width;
    height;
    rotation;
    qrCode;
    qrGeneratedAt;
    status;
    isActive;
    notes;
    createdAt;
    updatedAt;
    hall;
    features;
    reservations;
};
exports.Table = Table;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Table.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hall_id' }),
    __metadata("design:type", String)
], Table.prototype, "hallId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'table_number', length: 20 }),
    __metadata("design:type", String)
], Table.prototype, "tableNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'position_x' }),
    __metadata("design:type", Number)
], Table.prototype, "positionX", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'position_y' }),
    __metadata("design:type", Number)
], Table.prototype, "positionY", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 40 }),
    __metadata("design:type", Number)
], Table.prototype, "width", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 40 }),
    __metadata("design:type", Number)
], Table.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Table.prototype, "rotation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_code', length: 255, unique: true }),
    __metadata("design:type", String)
], Table.prototype, "qrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_generated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Table.prototype, "qrGeneratedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TableStatus,
        default: TableStatus.AVAILABLE,
    }),
    __metadata("design:type", String)
], Table.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Table.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Table.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Table.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Table.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => hall_entity_1.Hall, (hall) => hall.tables, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'hall_id' }),
    __metadata("design:type", hall_entity_1.Hall)
], Table.prototype, "hall", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => table_feature_entity_1.TableFeature, (feature) => feature.tables),
    (0, typeorm_1.JoinTable)({
        name: 'table_feature_mappings',
        joinColumn: { name: 'table_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'feature_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Table.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => reservation_entity_1.Reservation, (reservation) => reservation.table),
    __metadata("design:type", Array)
], Table.prototype, "reservations", void 0);
exports.Table = Table = __decorate([
    (0, typeorm_1.Entity)('tables')
], Table);
//# sourceMappingURL=table.entity.js.map