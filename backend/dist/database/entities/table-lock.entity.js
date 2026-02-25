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
exports.TableLock = exports.LockStatus = void 0;
const typeorm_1 = require("typeorm");
const table_entity_1 = require("./table.entity");
const reservation_entity_1 = require("./reservation.entity");
var LockStatus;
(function (LockStatus) {
    LockStatus["ACTIVE"] = "active";
    LockStatus["RELEASED"] = "released";
    LockStatus["CANCELLED"] = "cancelled";
})(LockStatus || (exports.LockStatus = LockStatus = {}));
let TableLock = class TableLock {
    id;
    tableId;
    reservationId;
    lockDate;
    lockStart;
    lockEnd;
    status;
    releaseScheduledAt;
    releasedAt;
    createdAt;
    table;
    reservation;
};
exports.TableLock = TableLock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TableLock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'table_id' }),
    __metadata("design:type", String)
], TableLock.prototype, "tableId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reservation_id' }),
    __metadata("design:type", String)
], TableLock.prototype, "reservationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lock_date', type: 'date' }),
    __metadata("design:type", Date)
], TableLock.prototype, "lockDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lock_start', type: 'timestamp' }),
    __metadata("design:type", Date)
], TableLock.prototype, "lockStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lock_end', type: 'timestamp' }),
    __metadata("design:type", Date)
], TableLock.prototype, "lockEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LockStatus,
        default: LockStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], TableLock.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'release_scheduled_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TableLock.prototype, "releaseScheduledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'released_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TableLock.prototype, "releasedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TableLock.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => table_entity_1.Table, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'table_id' }),
    __metadata("design:type", table_entity_1.Table)
], TableLock.prototype, "table", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reservation_entity_1.Reservation, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'reservation_id' }),
    __metadata("design:type", reservation_entity_1.Reservation)
], TableLock.prototype, "reservation", void 0);
exports.TableLock = TableLock = __decorate([
    (0, typeorm_1.Entity)('table_locks')
], TableLock);
//# sourceMappingURL=table-lock.entity.js.map