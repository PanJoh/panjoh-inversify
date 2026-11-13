import 'reflect-metadata';
import { describe, vi, afterEach, expect, test } from "vitest";
import { createTypeOrmModule, getDataSourceToken, getEntityToken } from "./typeorm-module.js";
import * as inversify from 'inversify';
import { Entity, Column, DataSource, type DataSourceOptions, PrimaryColumn, Repository, EntityManager } from 'typeorm';
import { injectDataSource, injectEntityManager, injectRepository } from './decorators.js';

@Entity('tests')
class TestEntity {
    @PrimaryColumn()
    id!: string
    
    @Column('varchar')
    testName!: string;

    @Column('unsigned big int')
    repetitions!: number;
}

@inversify.injectable()
class DataSourceTets {
    constructor(@injectDataSource() public dataSource: DataSource) {}
}

@inversify.injectable()
class RepositoryTest {
    constructor(@injectRepository(TestEntity) public testRepo: Repository<TestEntity>) {}
}


@inversify.injectable()
class EntityManagerTest {
    constructor(@injectEntityManager() public entityManager: EntityManager) {}
}

describe('typeorm module tests', () => {
    afterEach(() => vi.clearAllMocks());

    test('shell bind the datasource', async () => {
        const container = new inversify.Container();

        container.bind(DataSourceTets).toSelf().inSingletonScope();

        const databaseOptions: DataSourceOptions = {
            type: 'better-sqlite3',
            database: ':memory',
            dropSchema: true,
            synchronize: true,
            entities: [TestEntity],
        };

        container.load(createTypeOrmModule({
            type: 'better-sqlite3',
            database: ':memory',
            dropSchema: true,
            synchronize: true,
        }, [TestEntity]));

        const dataSource = await container.getAsync<DataSource>(getDataSourceToken());
        const myTest = await container.getAsync(DataSourceTets);


        expect(myTest.dataSource).toBe(dataSource);
        expect(dataSource.options).toEqual(databaseOptions);
    });

    test('It schell bind the entity repository', async () => {
        const container = new inversify.Container();

        container.load(createTypeOrmModule({
            type: 'better-sqlite3',
            database: ':memory',
            dropSchema: true,
            synchronize: true,
        }, [TestEntity]));

        
        container.bind(RepositoryTest).toSelf().inSingletonScope();

        const testRepo = await container.getAsync<Repository<TestEntity>>(getEntityToken(TestEntity));
        const repoTest = await container.getAsync(RepositoryTest);
        expect(testRepo).toBe(repoTest.testRepo);

        const dataSource = await container.getAsync<DataSource>(getDataSourceToken());

        const entity = await testRepo.create({
            id: '1',
            testName: 'some test',
            repetitions: 5,
        })

        await testRepo.save(entity);

        const entityFromSource = await dataSource.getRepository(TestEntity)
            .findOne({
                where: {id: '1'},
            })
        
        expect(entity).toEqual(entityFromSource);
    });

    test('it shell bind the right entity manager', async () => {
        const container = new inversify.Container();

        container.load(createTypeOrmModule({
            type: 'better-sqlite3',
            database: ':memory',
            dropSchema: true,
            synchronize: true,
        }, [TestEntity]));

        container.bind(EntityManagerTest).toSelf().inSingletonScope();

        const entityManagerTest = await container.getAsync(EntityManagerTest);

        const entityManager = entityManagerTest.entityManager;

        const dataSource = await container.getAsync<DataSource>(getDataSourceToken());

        const repo = dataSource.getRepository(TestEntity);

        const entity = repo.create({
            id: '1',
            testName: 'some test',
            repetitions: 10,
        });

        await repo.save(entity);

        const entityFromManager = await entityManager.findOne(TestEntity, {
            where: { id: '1'}
        });

        expect(entityFromManager).toEqual(entity);
    });
})

