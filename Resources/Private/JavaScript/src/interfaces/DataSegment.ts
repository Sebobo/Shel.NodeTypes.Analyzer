export default interface DataSegment {
    name: string;
    path: string;
    children?: DataSegment[];
    value?: any;
}
