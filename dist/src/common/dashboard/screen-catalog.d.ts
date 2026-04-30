export type ScreenModuleKey = 'executive' | 'tenders' | 'projects' | 'qaqc' | 'procurement' | 'maintenance';
export interface ScreenDefinition {
    module: ScreenModuleKey;
    key: string;
    title: string;
    endpoint: string;
    roles: string[];
}
export declare const SCREEN_CATALOG: ScreenDefinition[];
