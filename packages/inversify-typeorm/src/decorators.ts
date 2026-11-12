import { inject } from 'inversify';
import { getDataSourceToken, getEntityManagerToken, getEntityToken } from './typeorm-module.js';
import { DEFAULT_TYPEORM_DATA_SOURCE_TOKEN, DEFAULT_TYPEORM_ENTITY_MANAGER } from './constants.js';

export function injectRepository(entity: Function, dataSourceName?: string): ReturnType<typeof inject> {
    return inject(getEntityToken(entity, dataSourceName));
}

export function injectDataSource(dataSourceName?: string): ReturnType<typeof inject> {
    if (dataSourceName == null) {
        return inject(DEFAULT_TYPEORM_DATA_SOURCE_TOKEN);
    }

    const token = getDataSourceToken(dataSourceName);
    return inject(token);
}

export function injectEntityManager(dataSourceName?: string): ReturnType<typeof inject> {
    if (dataSourceName == null) {
        return inject(DEFAULT_TYPEORM_ENTITY_MANAGER);
    }

    const token = getEntityManagerToken(dataSourceName);
    return inject(token);
}