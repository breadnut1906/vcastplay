export interface User {
    id: number;
    code: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: number;
    role: Roles | null;
    status: string;
    createdOn: Date;
    updatedOn: Date;
}

export interface Roles {
    id: number;
    name: string;
    description: string;
    modules: any[];
    status: string;
    createdOn: Date;
    updatedOn: Date;
}
