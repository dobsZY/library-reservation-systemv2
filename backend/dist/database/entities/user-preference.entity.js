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
exports.UserPreference = void 0;
const typeorm_1 = require("typeorm");
let UserPreference = class UserPreference {
    id;
    userId;
    preferredFeatures;
    preferredHalls;
    notifyQrWarning;
    notifyExtendReminder;
    notifyLeaveWarning;
    fcmToken;
    fcmTokenUpdatedAt;
    createdAt;
    updatedAt;
};
exports.UserPreference = UserPreference;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserPreference.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', length: 50, unique: true }),
    __metadata("design:type", String)
], UserPreference.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preferred_features', type: 'uuid', array: true, nullable: true }),
    __metadata("design:type", Array)
], UserPreference.prototype, "preferredFeatures", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preferred_halls', type: 'uuid', array: true, nullable: true }),
    __metadata("design:type", Array)
], UserPreference.prototype, "preferredHalls", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notify_qr_warning', default: true }),
    __metadata("design:type", Boolean)
], UserPreference.prototype, "notifyQrWarning", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notify_extend_reminder', default: true }),
    __metadata("design:type", Boolean)
], UserPreference.prototype, "notifyExtendReminder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notify_leave_warning', default: true }),
    __metadata("design:type", Boolean)
], UserPreference.prototype, "notifyLeaveWarning", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fcm_token', length: 500, nullable: true }),
    __metadata("design:type", String)
], UserPreference.prototype, "fcmToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fcm_token_updated_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], UserPreference.prototype, "fcmTokenUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserPreference.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], UserPreference.prototype, "updatedAt", void 0);
exports.UserPreference = UserPreference = __decorate([
    (0, typeorm_1.Entity)('user_preferences')
], UserPreference);
//# sourceMappingURL=user-preference.entity.js.map