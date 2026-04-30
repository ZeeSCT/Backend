export declare class ScreenCatalogController {
    findAll(): {
        totalScreens: number;
        modules: Record<string, import("@/common/dashboard/screen-catalog").ScreenDefinition[]>;
    };
}
