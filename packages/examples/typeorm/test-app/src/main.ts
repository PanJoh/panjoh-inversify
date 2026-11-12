import { Container, inject, injectable } from 'inversify';
import { Column, DataSource, Entity, EntityManager, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, Repository, Unique } from 'typeorm';
import { createTypeOrmEntitiesModule, createTypeOrmModule, injectRepository } from '@panjoh/inversify-typeorm';
import { injectDataSource, injectEntityManager } from '@panjoh/inversify-typeorm/dist/decorators.js';


@Entity('users')
class User {
    @PrimaryColumn()
    id!: string;

    @Column('character varying', { length: 255, unique: true})
    username!: string;

    @Column('character varying', { length: 255, name: 'display_name'})
    displayName!: string;

    @OneToMany(() => Resource, (resource) => resource.owner)
    resources!: Resource[];
}

@Entity('resources')
class Resource {
    @PrimaryColumn()
    id!: string;

    @Column('character varying', { length: 255})
    name!: string;

    @ManyToOne(() => User)
    @JoinColumn({name: 'owner_id'})
    owner!: User;

    @Column('double precision')
    value!: number
}


const typeOrmModule = createTypeOrmModule({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'resource_tracking',
    username: 'admin',
    password: 'admin-pwd',
    synchronize: false,
}, [User]);

const entitesModule = createTypeOrmEntitiesModule([Resource]);

@injectable()
class Program {
    constructor(
        @injectRepository(User) private userRepo: Repository<User>,
        @injectRepository(Resource) private resourceRepo: Repository<Resource>,
    ) {}

    async run(username: string) {
        const users = await this.userRepo.find();
        for (const user of users) {
            console.log(`User with id (${user.id}) has name "${user.username}"`);
        }

        console.log();

        const resources = await this.resourceRepo.find();
        for (const resource of resources) {
            console.log(`Resource with id (${resource.id}) has name "${resource.name}"`);
        }

        const user = await this.userRepo.findOne({
            where: {username},
            relations: {
                resources: true,
            },
        });

        console.log();

        if (user == null) {
            console.log(`No user with name "${username}"`);
        } else {
            console.log(`Resources of user "${user.displayName}"`);
            for (const resources of user.resources) {
                console.log(` ${resources.name}`);
            }
        }
    }

    async updateResource(id: string, addent: number) {
        const updateResult = await this.resourceRepo.createQueryBuilder()
            .update()
            .set({value: () => 'value + :addent'})
            .setParameters({addent})
            .where({id})
            .returning(['value', 'name'])
            .execute();

        console.log();
        
        console.log(updateResult.affected);

        if (Array.isArray(updateResult.raw)) {
            if (updateResult.raw.length > 0) {
                const {value, name} = updateResult.raw[0] as {value: number, name: string};

                console.log(`New value of resource ${name}: ${value}`);
            }
        }
    }
}


const container = new Container();

container.load(typeOrmModule);
container.load(entitesModule);
container.bind(Program).toSelf().inSingletonScope();

const program = await container.getAsync(Program);
await program.run('PanJo');
await program.updateResource('e3d7bd2e-28c1-4f8f-9344-02ddde4a8ea2', 4);


const typeOrmModule2 = createTypeOrmModule({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'resource_tracking',
    username: 'admin',
    password: 'admin-pwd',
    synchronize: false,
}, [User], 'second-data-source');

container.load(typeOrmModule2);

@injectable()
class ShowUserProg {
    constructor(@injectRepository(User, 'second-data-source') private userRepo: Repository<User>) {}

    async run() {
        const users = await this.userRepo.find();

        for (const user of users) {
            console.log(user.displayName);
        }
    }
}

container.bind(ShowUserProg).toSelf().inSingletonScope();

const showUserProg = await container.getAsync(ShowUserProg);
await showUserProg.run()

@injectable()
class UseEntityManger {
    constructor(@injectEntityManager('second-data-source') private entityManager: EntityManager) {}

    async run() {
        const result = await this.entityManager.createQueryBuilder()
            .from(User, 'user')
            .select('display_name')
            .where({
                'username': 'PanJo',
            })
            .execute();
        for (const user of result) {
            console.log(user);
        }
    }
}

container.bind(UseEntityManger).toSelf().inSingletonScope();

const useEntityManager = await container.getAsync(UseEntityManger, {autobind: true});

await useEntityManager.run();

@injectable()
class TestEntityDifferent {
    constructor(
        @injectDataSource() private defaultDataSource: DataSource,
        @injectDataSource('second-data-source') private secondDataSource: DataSource,
        @injectEntityManager() private defaultEntityManager: EntityManager,
        @injectEntityManager('second-data-source') private secondEntityManager: EntityManager,
    ) {}

    run() {
        console.log(`Data Sources Different: ${this.defaultDataSource !== this.secondDataSource}`);
        console.log(`Entity Managers Different: ${this.defaultEntityManager !== this.secondEntityManager}`);
    }
}

container.bind(TestEntityDifferent).toSelf().inSingletonScope();

const testDifferent = await container.getAsync(TestEntityDifferent);
testDifferent.run();