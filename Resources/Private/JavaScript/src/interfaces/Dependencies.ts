import { DataSegment } from './index';

export enum LinkType {
    INHERITS = 'inherits'
}

export default interface Dependencies {
    nodes: {
        children: DataSegment[];
    };
    links: {
        source: string;
        target: string;
        group: string;
        type: LinkType;
    }[];
}
