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
exports.Reservation = exports.ReservationStatus = void 0;
const typeorm_1 = require("typeorm");
const table_entity_1 = require("./table.entity");
const hall_entity_1 = require("./hall.entity");
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["PENDING"] = "pending";
    ReservationStatus["ACTIVE"] = "active";
    ReservationStatus["COMPLETED"] = "completed";
    ReservationStatus["EXTENDED"] = "extended";
    ReservationStatus["CANCELLED"] = "cancelled";
    ReservationStatus["EXPIRED"] = "expired";
    ReservationStatus["NO_SHOW"] = "no_show";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
let Reservation = class Reservation {
    id;
    userId;
    tableId;
    hallId;
    reservationDate;
    startTime;
    endTime;
    lockEndTime;
    durationHours;
    isChain;
    chainId;
    chainSequence;
    previousReservationId;
    status;
    checkedInAt;
    checkInLatitude;
    checkInLongitude;
    checkInDistanceMeters;
    qrDeadline;
    notifQrWarningSent;
    notifQrExpiredSent;
    notifExtendReminderSent;
    notifLeaveWarningSent;
    cancelledAt;
    cancelledReason;
    completedAt;
    createdAt;
    updatedAt;
    table;
    hall;
    previousReservation;
    chainedReservations;
};
exports.Reservation = Reservation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Reservation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', length: 50 }),
    __metadata("design:type", String)
], Reservation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'table_id' }),
    __metadata("design:type", String)
], Reservation.prototype, "tableId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hall_id' }),
    __metadata("design:type", String)
], Reservation.prototype, "hallId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reservation_date', type: 'date' }),
    __metadata("design:type", Date)
], Reservation.prototype, "reservationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'timestamp' }),
    __metadata("design:type", Date)
], Reservation.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'timestamp' }),
    __metadata("design:type", Date)
], Reservation.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lock_end_time', type: 'timestamp' }),
    __metadata("design:type", Date)
], Reservation.prototype, "lockEndTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_hours' }),
    __metadata("design:type", Number)
], Reservation.prototype, "durationHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_chain', default: false }),
    __metadata("design:type", Boolean)
], Reservation.prototype, "isChain", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'chain_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Reservation.prototype, "chainId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'chain_sequence', default: 1 }),
    __metadata("design:type", Number)
], Reservation.prototype, "chainSequence", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'previous_reservation_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Reservation.prototype, "previousReservationId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReservationStatus,
        default: ReservationStatus.PENDING,
    }),
    __metadata("design:type", String)
], Reservation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'checked_in_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Reservation.prototype, "checkedInAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'check_in_latitude', type: 'decimal', precision: 10, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Reservation.prototype, "checkInLatitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'check_in_longitude', type: 'decimal', precision: 11, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Reservation.prototype, "checkInLongitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'check_in_distance_meters', type: 'decimal', precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Reservation.prototype, "checkInDistanceMeters", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_deadline', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Reservation.prototype, "qrDeadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notif_qr_warning_sent', default: false }),
    __metadata("design:type", Boolean)
], Reservation.prototype, "notifQrWarningSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notif_qr_expired_sent', default: false }),
    __metadata("design:type", Boolean)
], Reservation.prototype, "notifQrExpiredSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notif_extend_reminder_sent', default: false }),
    __metadata("design:type", Boolean)
], Reservation.prototype, "notifExtendReminderSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notif_leave_warning_sent', default: false }),
    __metadata("design:type", Boolean)
], Reservation.prototype, "notifLeaveWarningSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cancelled_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Reservation.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cancelled_reason', length: 255, nullable: true }),
    __metadata("design:type", String)
], Reservation.prototype, "cancelledReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Reservation.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Reservation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Reservation.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => table_entity_1.Table, (table) => table.reservations),
    (0, typeorm_1.JoinColumn)({ name: 'table_id' }),
    __metadata("design:type", table_entity_1.Table)
], Reservation.prototype, "table", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => hall_entity_1.Hall),
    (0, typeorm_1.JoinColumn)({ name: 'hall_id' }),
    __metadata("design:type", hall_entity_1.Hall)
], Reservation.prototype, "hall", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Reservation),
    (0, typeorm_1.JoinColumn)({ name: 'previous_reservation_id' }),
    __metadata("design:type", Reservation)
], Reservation.prototype, "previousReservation", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Reservation, (reservation) => reservation.previousReservation),
    __metadata("design:type", Array)
], Reservation.prototype, "chainedReservations", void 0);
exports.Reservation = Reservation = __decorate([
    (0, typeorm_1.Entity)('reservations')
], Reservation);
//# sourceMappingURL=reservation.entity.js.map