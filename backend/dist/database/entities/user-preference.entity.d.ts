export declare class UserPreference {
    id: string;
    userId: string;
    preferredFeatures: string[];
    preferredHalls: string[];
    notifyQrWarning: boolean;
    notifyExtendReminder: boolean;
    notifyLeaveWarning: boolean;
    fcmToken: string;
    fcmTokenUpdatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
