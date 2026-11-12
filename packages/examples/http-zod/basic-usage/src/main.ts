import { ZodPipe, type SchemaType } from '@panjoh-inversify/http-zod';
import z from 'zod';

const MultiplyRequestSchema = z.object({
    a: z.number(),
    b: z.number(),
});

type MultiplyRequest = SchemaType<typeof MultiplyRequestSchema>;

const MultiplyRequestPipe = ZodPipe(MultiplyRequestSchema);

class Program {
    multiplyRequestPipe = new MultiplyRequestPipe();

    constructor(private payload: unknown) {
        
    }

    async run() {
        try {
            const request: MultiplyRequest = await Promise.try(() => this.multiplyRequestPipe.execute(this.payload, {targetClass: Program, methodName: 'run', parameterIndex: -1}))
            const result = request.a * request.b;
            console.log(`multiplication result is ${result}`);
        } catch (err) {
            console.error(err);
        }
    }
}


//will log the result of multiplication
await new Program({a: 5, b: 7}).run();

console.log()

//will log a bad request error
await new Program({}).run();