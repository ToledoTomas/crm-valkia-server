import { DataSource } from 'typeorm';
import { User, UserRole } from '../src/user/entity/user.entity';
import * as bcrypt from 'bcrypt';

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

async function createAdminUser() {
  try {
    await AppDataSource.initialize();
    console.log('Conectado a la base de datos');

    const userRepository = AppDataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email: 'valkia@admin.com' },
    });

    if (existingUser) {
      console.log('⚠️  El usuario valkia@admin.com ya existe');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Pass123', 10);

    const user = userRepository.create({
      email: 'valkia@admin.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    await userRepository.save(user);
    console.log('✅ Usuario creado exitosamente:');
    console.log(`   Email: valkia@admin.com`);
    console.log(`   Password: Pass123`);
    console.log(`   Role: ADMIN`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    process.exit(1);
  }
}

createAdminUser();
