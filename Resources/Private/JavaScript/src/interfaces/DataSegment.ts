export default interface DataSegment {
    name: string;
    path: string;
    group?: string;
    children?: DataSegment[];
    value?: number;
}
