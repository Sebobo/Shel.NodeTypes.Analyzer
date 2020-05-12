import { DataSegment } from './index';

export enum LinkType {
    INHERITS = 'inherits'
}

export default interface Dependencies {
    nodes: {
        children: DataSegment[];
    };
    links: {
        source: NodeTypeName;
        target: NodeTypeName;
        group: string;
        type: LinkType;
    }[];
}
