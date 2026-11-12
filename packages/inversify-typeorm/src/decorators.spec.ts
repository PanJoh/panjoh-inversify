import { describe, test, expect, vi } from 'vitest';
import * as inversify from 'inversify';
import { injectDataSource, injectEntityManager, injectRepository } from './decorators.js'; 
import { afterEach } from 'node:test';
import { getDataSourceToken, getEntityToken, getEntityManagerToken } from './typeorm-module.js';
import { Entity } from 'typeorm';

@Entity() 
class TestEntity {
}

describe('decorator tests', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test('inject repo should call with correct token', () => {
        const entityToken = getEntityToken(TestEntity);
        const injectSpy = vi.spyOn(inversify, 'inject');

        injectRepository(TestEntity);

        expect(injectSpy).toHaveBeenCalledWith(entityToken);
    });

    test('inject repo with database name should call wit correct token', () => {
        const injectSpy = vi.spyOn(inversify, 'inject');

        injectRepository(TestEntity, 'my-data-source');

        const entityToken = getEntityToken(TestEntity, 'my-data-source');

        expect(injectSpy).toHaveBeenCalledWith(entityToken);
    });

    test('inject datasource should call with correct token', () => {
        const injectSpy = vi.spyOn(inversify, 'inject');

        injectDataSource();

        const token = getDataSourceToken();

        expect(injectSpy).toHaveBeenCalledWith(token);
    });

    test('inject datasource with datasource name shold call with correct token', () => {
        const injectSpy = vi.spyOn(inversify, 'inject');

        injectDataSource('my-data-source');

        const token = getDataSourceToken('my-data-source');

        expect(injectSpy).toHaveBeenCalledWith(token);
    });

    test('inject entity manager should call with correct token', () => {
        const injectSpy = vi.spyOn(inversify, 'inject');

        injectEntityManager();

        const token = getEntityManagerToken();

        expect(injectSpy).toHaveBeenCalledWith(token);
    });

    test('inject entity manager with datasource name should call with correct token', () => {
        const injectSpy = vi.spyOn(inversify, 'inject');

        injectEntityManager('my-data-source');

        const token = getEntityManagerToken('my-data-source');

        expect(injectSpy).toHaveBeenCalledWith(token);
    });

    test('inject repo shell return whatever inject returns', () => {
        const injectSpy = vi.spyOn(inversify, 'inject');

        const decorator = (target: unknown) => undefined;

        injectSpy.mockReturnValue(decorator);

        const result = injectRepository(TestEntity);

        expect(injectSpy).toHaveBeenCalledOnce();
        expect(result).toBe(decorator);
    });

    test('inject data source shell return whatever inject returns', () => {
        const injectSpy = vi.spyOn(inversify, 'inject');
        const decorator = (target: unknown) => undefined;

        injectSpy.mockReturnValue(decorator);

        const result = injectDataSource();

        expect(injectSpy).toHaveBeenCalledOnce();
        expect(result).toBe(decorator);
    });

    test('inject entity manager shell return wahtever inject returns', () => {
        const injectSpy = vi.spyOn(inversify, 'inject');
        const decorator = (target: unknown) => undefined;

        injectSpy.mockReturnValue(decorator);

        const result = injectEntityManager();

        expect(injectSpy).toHaveBeenCalledOnce();
        expect(result).toBe(decorator);
    });
});