import 'reflect-metadata';
import { describe, it, vi, afterEach, Mock, expect } from "vitest";
import { createTypeOrmModule, getDataSourceToken, getEntityToken } from "./typeorm-module";
import * as inversify from 'inversify';
import typeorm, { Column, DataSource, Entity, Repository } from "typeorm";

@Entity('tests')
class TestEntity {
    
    @Column('character varying')
    testName!: string;

    @Column('unsigned big int')
    repetitions!: number;
}

describe('typeorm module tests', () => {
    afterEach(() => vi.clearAllMocks());

    it('shell bind the datasource', async () => {
        const testDataSource = new DataSource({
            type: 'better-sqlite3',
            database: ':memory',
            dropSchema: true,
            entities: [TestEntity],
            synchronize: true,
        });

        vi.spyOn(typeorm, 'DataSource').mockImplementation(() => testDataSource);

        const container = new inversify.Container();

        container.load(createTypeOrmModule({
            type: 'better-sqlite3',
            database: ':memory',
            dropSchema: true,
            entities: [TestEntity],
            synchronize: true,
        }, [TestEntity]));

        const boundDataSource = await container.getAsync(getDataSourceToken());
    
        expect(boundDataSource).toBe(testDataSource);
    });
})

