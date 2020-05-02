import { DataSegment } from './index';

export enum LinkType {
    INHERITS = 'inherits'
}

export default interface Dependencies {
    nodes: DataSegment[];
    links: {
        source: string;
        target: string;
        type: LinkType;
    }[];
}
