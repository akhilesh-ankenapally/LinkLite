import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting LinkLite database seed...');

  // Clean existing records
  await prisma.clickLog.deleteMany();
  await prisma.url.deleteMany();

  const seedUrls = [
    {
      originalUrl: 'https://linear.app/features',
      shortCode: 'linear-ft',
      clickCount: 142,
      clicks: [
        { country: 'US', referrer: 'twitter.com' },
        { country: 'US', referrer: 'news.ycombinator.com' },
        { country: 'GB', referrer: 'github.com' },
        { country: 'DE', referrer: 'Direct' },
        { country: 'IN', referrer: 'linkedin.com' },
        { country: 'CA', referrer: 'google.com' },
      ],
    },
    {
      originalUrl: 'https://vercel.com/docs/frameworks/nextjs',
      shortCode: 'nextjs-docs',
      clickCount: 89,
      clicks: [
        { country: 'US', referrer: 'google.com' },
        { country: 'JP', referrer: 'qiita.com' },
        { country: 'FR', referrer: 'Direct' },
      ],
    },
    {
      originalUrl: 'https://stripe.com/docs/api',
      shortCode: 'stripe-api',
      clickCount: 310,
      clicks: [
        { country: 'US', referrer: 'stackoverflow.com' },
        { country: 'GB', referrer: 'google.com' },
        { country: 'IN', referrer: 'Direct' },
      ],
    },
  ];

  for (const item of seedUrls) {
    const url = await prisma.url.create({
      data: {
        originalUrl: item.originalUrl,
        shortCode: item.shortCode,
        clickCount: item.clickCount,
      },
    });

    for (const click of item.clicks) {
      await prisma.clickLog.create({
        data: {
          urlId: url.id,
          country: click.country,
          referrer: click.referrer,
        },
      });
    }
  }

  console.log('✅ Seed completed successfully with realistic test records.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
