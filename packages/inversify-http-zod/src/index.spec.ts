import { describe, expect, it, afterEach, vi } from "vitest";
import z, { object } from 'zod';
import { ZodPipe } from './index.js';
import { BadRequestHttpResponse, Pipe } from "@inversifyjs/http-core";

const TestSchema = z.object({
    username: z.string(),
    password: z.string(),
});

class MyClass {}

type PipeTestValidResult<R> = {
    result: R | Promise<R>,
};

type PipeTestErrorResult = {
    error: Error,
}

type PipeTestResult<R> = PipeTestValidResult<R> | PipeTestErrorResult;

function testPipeCall<R>(pipe: Pipe<unknown, R>, input: unknown): PipeTestResult<R>  {
    try {
        return { result: pipe.execute(input, {targetClass: MyClass, methodName: 'none', parameterIndex: 1})};
    } catch (err) {
        return { error: err as Error};
    }
}

function isErrorResult<R>(res: PipeTestResult<R>): res is PipeTestErrorResult {
    return Object.hasOwn(res, 'error');
}

describe('zod pipe tests', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should transform payload correctly', () => {
        const payload = { username: 'some user', password: 'some-password'};
        const Pipe = ZodPipe(TestSchema);
        const pipe = new Pipe();

        const transformed = pipe.execute(payload, { targetClass: MyClass, methodName: 'none', parameterIndex: 1});

        expect(transformed).toEqual(payload);
    });

    it('should throw bad reqeust exception on wrong payload', () => {
        const payload = { username: 'some user'};
        const Pipe = ZodPipe(TestSchema);
        const pipe = new Pipe();

        const res = testPipeCall(pipe, payload);
        
        const resTest = isErrorResult(res);

        expect(resTest).toBeTruthy();

        if (resTest) {
            expect(res.error instanceof BadRequestHttpResponse).toBeTruthy();
        }
    });
});