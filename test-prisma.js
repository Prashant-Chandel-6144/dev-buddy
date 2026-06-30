const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.user.update({
      where: { id: "test" },
      data: { aiCredits: 10 }
    });
    console.log("Success");
  } catch(e) {
    console.log(e.name);
    console.log(e.message);
  }
}

main();
