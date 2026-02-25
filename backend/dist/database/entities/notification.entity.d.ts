import { Reservation } from './reservation.entity';
export declare enum NotificationType {
    QR_WARNING = "qr_warning",
    QR_EXPIRED = "qr_expired",
    EXTEND_REMINDER = "extend_reminder",
    LEAVE_WARNING = "leave_warning",
    RESERVATION_CONFIRMED = "reservation_confirmed",
    RESERVATION_CANCELLED = "reservation_cancelled",
    CHECK_IN_SUCCESS = "check_in_success"
}
export declare class Notification {
    id: string;
    userId: string;
    reservationId: string;
    notificationType: NotificationType;
    title: string;
    body: string;
    sentAt: Date;
    readAt: Date;
    clickedAt: Date;
    fcmMessageId: string;
    fcmStatus: string;
    reservation: Reservation;
}
