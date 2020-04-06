// TODO: This is a copy of the interface in Neos.Ui and should preferably be made available to plugins
export default interface I18nRegistry {
    translate: (id?: string, fallback?: string, params?: {}, packageKey?: string, sourceName?: string) => string;
}
