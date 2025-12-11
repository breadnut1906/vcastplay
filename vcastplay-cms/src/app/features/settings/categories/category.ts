export interface Category {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}


export interface SubCategory {
    id: number;
    categoryId: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}