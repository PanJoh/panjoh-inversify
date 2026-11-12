import { Container } from 'inversify';
import { Controller, Post, Body } from '@inversifyjs/http-core';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import z from 'zod';
import { ZodPipe, type SchemaType } from '@panjoh-inversify/http-zod';

const CreateCarRequestSchema = z.object({
    type: z.string(),
    hp: z.uint32(),
});

type CreateCarRequest = SchemaType<typeof CreateCarRequestSchema>;

const CreateCarRequestPipe = ZodPipe(CreateCarRequestSchema);

@Controller('/api/cars')
class CarController {
    @Post()
    createCar(@Body(CreateCarRequestPipe) createCarRequest: CreateCarRequest) {
        console.log('createing car with')
        console.log(`  type: ${createCarRequest.type}`);
        console.log(`  hp:   ${createCarRequest.hp}`);
    }
}

const container = new Container();
container.bind(CarController).toSelf().inSingletonScope();
container.bind(CreateCarRequestPipe).toSelf().inSingletonScope();

const expressAdapter = new InversifyExpressHttpAdapter(container);

const app = await expressAdapter.build();

app.listen(3000);

