import { ZodError } from 'zod';
import { BadRequestHttpResponse, type Pipe, type PipeMetadata } from '@inversifyjs/http-core';
import { injectable } from '@inversifyjs/core';

export type SchemaType<T> = T extends {parse: (input: unknown) => infer R} ? R : unknown;

export function ZodPipe<R>(schema: {parse: (input: unknown) => R}): { new(): Pipe<unknown, R> } {
    @injectable()
    class ZodPipeClass implements Pipe<unknown, R> {
        execute(input: unknown, metadata: PipeMetadata): R | Promise<R> {
            try {
                return schema.parse(input);
            } catch (err) {
                if (err instanceof ZodError) {
                    throw new BadRequestHttpResponse(`zod error happened`);
                }

                throw err;
            }
        }
    }

    return ZodPipeClass;
}
