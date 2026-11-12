import { DataSource, EntityManager, Repository, type EntitySchema } from "typeorm";
import { ContainerModule, injectable, type ContainerModuleLoadOptions } from 'inversify';
import type { DataSourceOptions } from "typeorm/browser";
import { DEFAULT_TYPEORM_DATA_SOURCE_TOKEN, DEFAULT_TYPEORM_ENTITY_MANAGER } from './constants.js'




const entityTokenRegistry: Map<symbol, Map<Function, symbol>> = new Map();
const dataSourceTokenRegistry: Map<string, symbol> = new Map();
const entityManagerTokenRegistry: Map<symbol, symbol> = new Map();

export function getEntityManagerToken(dataSourceName?: string) {
    if (dataSourceName == null) {
        return DEFAULT_TYPEORM_ENTITY_MANAGER;
    }

    const dataSourceToken = getDataSourceToken(dataSourceName);
    let entityManagerToken = entityManagerTokenRegistry.get(dataSourceToken);
    if (entityManagerToken == null) {
        entityManagerToken = Symbol();
        entityManagerTokenRegistry.set(dataSourceToken, entityManagerToken);
    }

    return entityManagerToken;
}

export function getDataSourceToken(dataSourceName?: string) {
    if (dataSourceName == null) {
        return DEFAULT_TYPEORM_DATA_SOURCE_TOKEN;
    }
    let token = dataSourceTokenRegistry.get(dataSourceName);
    if (token == null) {
        token = Symbol();
        dataSourceTokenRegistry.set(dataSourceName, token);
    }

    return token;
}

export function getEntityToken(
    entity: Function,
    dataSourceName?: string,
) {
    let dataSourceToken: symbol

    if (dataSourceName == null) {
        dataSourceToken = DEFAULT_TYPEORM_DATA_SOURCE_TOKEN;
    } else {
        dataSourceToken = getDataSourceToken(dataSourceName);
    }

    let entityTokenEntry = entityTokenRegistry.get(dataSourceToken);
    if (entityTokenEntry == null) {
        entityTokenEntry = new Map<Function, symbol>();
        entityTokenRegistry.set(dataSourceToken, entityTokenEntry);
    }

    let entityToken = entityTokenEntry.get(entity);
    if (entityToken == null) {
        entityToken = Symbol();
        entityTokenEntry.set(entity, entityToken);
    }

    return entityToken
}

function provideEntities(
    entities: Function[],
    moduleLoadOptions: ContainerModuleLoadOptions, 
    dataSourceName?: string
) {
    return entities.map(entity => {
        moduleLoadOptions.bind(EntityToken).toConstantValue(entity);
        moduleLoadOptions.bind<Repository<typeof entity>>(getEntityToken(entity, dataSourceName)).toResolvedValue(
            (DataSource: DataSource) => DataSource.getRepository(entity),
            [{
                serviceIdentifier: getDataSourceToken(dataSourceName),
            }],
        ).inSingletonScope();
    })
}

const EntityToken = Symbol('entity');

export function createTypeOrmEntitiesModule(entities: Function[], dataSourceName?: string) {
    return new ContainerModule(options => {
        provideEntities(entities, options, dataSourceName);
    });
}

export function createTypeOrmModule(
    options: DataSourceOptions,
    entities?: Function[],
    dataSourceName?: string
) {
    return new ContainerModule(containerOptions => {
        if (entities != null) {
            provideEntities(entities, containerOptions, dataSourceName);
        }
        containerOptions
            .bind<DataSource>(getDataSourceToken(dataSourceName))
            .toResolvedValue((entities?: Function[]) => {
                const effectiveOptions = {
                    ...options,
                    entities: entities != null ? entities : null,
                } as DataSourceOptions;
                return new DataSource(effectiveOptions).initialize();
            }, [{
                serviceIdentifier: EntityToken,
                isMultiple: true,
                optional: true
            }]).inSingletonScope();

        containerOptions.bind<EntityManager>(getEntityManagerToken(dataSourceName)).toResolvedValue(
            (dataSource: DataSource) => dataSource.manager,
            [
                {
                    serviceIdentifier: getDataSourceToken(dataSourceName),
                }
            ]
        )
    })
}


