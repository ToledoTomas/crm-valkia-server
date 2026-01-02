import { DataSource } from 'typeorm';
import { User } from '../src/user/entity/user.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'pass123',
  database: process.env.DB_DATABASE || 'crm_valkia',
  entities: [User],
  synchronize: false,
  logging: true,
});

async function deleteAllUsers() {
  try {
    await AppDataSource.initialize();
    console.log('Conectado a la base de datos');

    const userRepository = AppDataSource.getRepository(User);
    const result = await userRepository.delete({});

    console.log(`✅ Se eliminaron ${result.affected} usuarios`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al eliminar usuarios:', error);
    process.exit(1);
  }
}

deleteAllUsers();
