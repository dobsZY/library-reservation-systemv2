import { StatisticsService } from './statistics.service';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getOverallOccupancy(): Promise<import("./statistics.service").OverallStatistics>;
    getHallOccupancy(hallId: string): Promise<import("./statistics.service").HallOccupancy>;
}
