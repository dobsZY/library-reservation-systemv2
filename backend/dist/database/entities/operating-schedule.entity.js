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
exports.OperatingSchedule = exports.ScheduleType = void 0;
const typeorm_1 = require("typeorm");
var ScheduleType;
(function (ScheduleType) {
    ScheduleType["NORMAL"] = "normal";
    ScheduleType["EXAM_MIDTERM"] = "exam_midterm";
    ScheduleType["EXAM_FINAL"] = "exam_final";
    ScheduleType["HOLIDAY"] = "holiday";
})(ScheduleType || (exports.ScheduleType = ScheduleType = {}));
let OperatingSchedule = class OperatingSchedule {
    id;
    name;
    scheduleType;
    startDate;
    endDate;
    is24h;
    openingTime;
    closingTime;
    maxDurationHours;
    chainQrTimeoutMinutes;
    isActive;
    createdAt;
};
exports.OperatingSchedule = OperatingSchedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OperatingSchedule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], OperatingSchedule.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'schedule_type',
        type: 'enum',
        enum: ScheduleType,
        default: ScheduleType.NORMAL,
    }),
    __metadata("design:type", String)
], OperatingSchedule.prototype, "scheduleType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", Date)
], OperatingSchedule.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date' }),
    __metadata("design:type", Date)
], OperatingSchedule.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_24h', default: false }),
    __metadata("design:type", Boolean)
], OperatingSchedule.prototype, "is24h", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opening_time', type: 'time', default: '08:00' }),
    __metadata("design:type", String)
], OperatingSchedule.prototype, "openingTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'closing_time', type: 'time', default: '23:00' }),
    __metadata("design:type", String)
], OperatingSchedule.prototype, "closingTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_duration_hours', default: 3 }),
    __metadata("design:type", Number)
], OperatingSchedule.prototype, "maxDurationHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'chain_qr_timeout_minutes', default: 15 }),
    __metadata("design:type", Number)
], OperatingSchedule.prototype, "chainQrTimeoutMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], OperatingSchedule.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], OperatingSchedule.prototype, "createdAt", void 0);
exports.OperatingSchedule = OperatingSchedule = __decorate([
    (0, typeorm_1.Entity)('operating_schedules')
], OperatingSchedule);
//# sourceMappingURL=operating-schedule.entity.js.map