export declare function screenResponse(screenKey: string, title: string, payload: Record<string, unknown>): {
    screenKey: string;
    title: string;
    generatedAt: string;
};
export declare function enumCountRows(grouped: Array<Record<string, any>>, key: string, label?: string): {
    [label]: any;
    key: any;
}[];
