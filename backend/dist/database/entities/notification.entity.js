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
exports.Notification = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
const reservation_entity_1 = require("./reservation.entity");
var NotificationType;
(function (NotificationType) {
    NotificationType["QR_WARNING"] = "qr_warning";
    NotificationType["QR_EXPIRED"] = "qr_expired";
    NotificationType["EXTEND_REMINDER"] = "extend_reminder";
    NotificationType["LEAVE_WARNING"] = "leave_warning";
    NotificationType["RESERVATION_CONFIRMED"] = "reservation_confirmed";
    NotificationType["RESERVATION_CANCELLED"] = "reservation_cancelled";
    NotificationType["CHECK_IN_SUCCESS"] = "check_in_success";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let Notification = class Notification {
    id;
    userId;
    reservationId;
    notificationType;
    title;
    body;
    sentAt;
    readAt;
    clickedAt;
    fcmMessageId;
    fcmStatus;
    reservation;
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', length: 50 }),
    __metadata("design:type", String)
], Notification.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reservation_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "reservationId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'notification_type',
        type: 'enum',
        enum: NotificationType,
    }),
    __metadata("design:type", String)
], Notification.prototype, "notificationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "body", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'sent_at' }),
    __metadata("design:type", Date)
], Notification.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'read_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clicked_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "clickedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fcm_message_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "fcmMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fcm_status', length: 50, nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "fcmStatus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reservation_entity_1.Reservation),
    (0, typeorm_1.JoinColumn)({ name: 'reservation_id' }),
    __metadata("design:type", reservation_entity_1.Reservation)
], Notification.prototype, "reservation", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('notification_logs')
], Notification);
//# sourceMappingURL=notification.entity.js.map