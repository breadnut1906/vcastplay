export interface Group {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}


export interface SubGroup {
    id: number;
    groupId: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}