//
import { prisma } from "./prisma";

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
    },
  });

  console.log("Created user:", user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
