import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { id: "ws-default" },
    update: {},
    create: {
      id: "ws-default",
      name: "Default Workspace",
    },
  });

  await prisma.app_user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      workspaceId: workspace.id,
      email: "owner@example.com",
      passwordHash: "dev-hash",
      role: UserRole.owner,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
