import { PrismaClient } from "../lib/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const createdAt = new Date("2026-07-09T23:50:01");
  const offerDeadline = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);

  await prisma.lead.create({
    data: {
      clientName: "Zelimhan",
      product: "Тариф Премиум",
      amount: 16800,
      currency: "RUB",
      status: "NEW",
      email: "usm008049@gmail.com",
      phone: "79640660066",
      dealNumber: "864722196",
      createdAt,
      offerDeadline,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
