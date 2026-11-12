import type { EntitySchema } from "typeorm";

export function getRepositoryToken(entity: Function): string {
    return `${entity.name}Repository`;
}