export interface Note {
    id: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    isDeleted: boolean;
    title: string | null;
    lines: string[] | null;
    isFavorite: boolean | null;
}