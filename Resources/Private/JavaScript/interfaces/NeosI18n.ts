export default interface NeosI18n {
    translate: (id: string, fallback: string, packageKey: string, source: string, parameters: any[]) => string;
    initialized: boolean;
}
