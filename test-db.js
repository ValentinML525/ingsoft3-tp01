const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.ubicacion.count()
  .then(n => {
    console.log('ubicaciones count:', n);
    return prisma.$disconnect();
  })
  .catch(e => {
    console.error('ERROR:', e.message);
    return prisma.$disconnect();
  });
