import { PrismaClient, Role, DosageForm } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed branch
  const branch = await prisma.branch.create({
    data: {
      name: 'Main Branch',
      address: 'Bole Road, Addis Ababa',
      phone: '+251911000000',
    },
  });

  // Seed default settings
  const settings = [
    { key: 'branchName', value: 'Main Branch' },
    { key: 'currency', value: 'ETB' },
    { key: 'taxRate', value: '0.15' },
    { key: 'expiryAlertDays', value: '30' },
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // Seed users
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const pharmPassword = await bcrypt.hash('Pharm@1234', 12);
  const cashPassword = await bcrypt.hash('Cash@1234', 12);

  const usersData = [
    { name: 'Admin User', email: 'admin@pharmacy.com', passwordHash: adminPassword, role: Role.ADMIN },
    { name: 'Pharmacist User', email: 'pharmacist@pharmacy.com', passwordHash: pharmPassword, role: Role.PHARMACIST },
    { name: 'Cashier User', email: 'cashier@pharmacy.com', passwordHash: cashPassword, role: Role.CASHIER },
  ];

  for (const userData of usersData) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: { passwordHash: userData.passwordHash, role: userData.role },
      create: userData,
    });
  }

  // Seed categories
  const categoryNames = ['Antibiotics', 'Analgesics', 'Vitamins & Supplements'];
  const categories: Record<string, string> = {};

  for (const name of categoryNames) {
    const existing = await prisma.category.findFirst({ where: { name } });
    if (existing) {
      categories[name] = existing.id;
    } else {
      const created = await prisma.category.create({ data: { name } });
      categories[name] = created.id;
    }
  }

  // Seed products
  const productsData = [
    {
      name: 'Amoxicillin 500mg',
      genericName: 'Amoxicillin',
      categoryId: categories['Antibiotics'],
      dosageForm: DosageForm.CAPSULE,
      strength: '500mg',
      barcode: '6012345678901',
      unitOfMeasure: 'Capsule',
      defaultSellingPrice: 15.5,
      requiresPrescription: true,
      reorderLevel: 50,
    },
    {
      name: 'Paracetamol 500mg',
      genericName: 'Paracetamol',
      categoryId: categories['Analgesics'],
      dosageForm: DosageForm.TABLET,
      strength: '500mg',
      barcode: '6012345678902',
      unitOfMeasure: 'Tablet',
      defaultSellingPrice: 2.0,
      requiresPrescription: false,
      reorderLevel: 100,
    },
    {
      name: 'Vitamin C 1000mg',
      genericName: 'Ascorbic Acid',
      categoryId: categories['Vitamins & Supplements'],
      dosageForm: DosageForm.TABLET,
      strength: '1000mg',
      barcode: '6012345678903',
      unitOfMeasure: 'Tablet',
      defaultSellingPrice: 5.0,
      requiresPrescription: false,
      reorderLevel: 30,
    },
  ];

  const products: Record<string, string> = {};

  for (const prodData of productsData) {
    const existing = await prisma.product.findUnique({ where: { barcode: prodData.barcode } });
    if (existing) {
      products[prodData.name] = existing.id;
    } else {
      const created = await prisma.product.create({ data: prodData });
      products[prodData.name] = created.id;
    }
  }

  // Seed supplier
  let supplier = await prisma.supplier.findFirst({ where: { name: 'Addis Pharma Distributors' } });
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        name: 'Addis Pharma Distributors',
        contactPerson: 'Abebe Kebede',
        phone: '+251911223344',
        email: 'sales@addispharma.com',
      },
    });
  }

  // Seed batches
  const now = new Date();
  const futureExpiry1 = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
  const futureExpiry2 = new Date(now.getFullYear(), now.getMonth() + 8, now.getDate());
  const futureExpiry3 = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@pharmacy.com' } });

  const batchesData = [
    {
      productId: products['Amoxicillin 500mg'],
      batchNumber: 'BATCH-AMX-001',
      expiryDate: futureExpiry1,
      quantityOnHand: 200,
      costPrice: 10.0,
      sellingPrice: 15.5,
      supplierId: supplier.id,
    },
    {
      productId: products['Paracetamol 500mg'],
      batchNumber: 'BATCH-PCM-001',
      expiryDate: futureExpiry2,
      quantityOnHand: 500,
      costPrice: 1.2,
      sellingPrice: 2.0,
      supplierId: supplier.id,
    },
    {
      productId: products['Vitamin C 1000mg'],
      batchNumber: 'BATCH-VTC-001',
      expiryDate: futureExpiry3,
      quantityOnHand: 8, // Low stock demo
      costPrice: 3.0,
      sellingPrice: 5.0,
      supplierId: supplier.id,
    },
  ];

  for (const batchData of batchesData) {
    const existing = await prisma.batch.findFirst({
      where: { productId: batchData.productId, batchNumber: batchData.batchNumber },
    });

    if (!existing) {
      const createdBatch = await prisma.batch.create({ data: batchData });

      if (adminUser) {
        await prisma.stockMovement.create({
          data: {
            productId: createdBatch.productId,
            batchId: createdBatch.id,
            type: 'PURCHASE_IN',
            quantity: createdBatch.quantityOnHand,
            performedBy: adminUser.id,
            reason: 'Initial seed stock receipt',
          },
        });
      }
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('Sample Users created:');
  console.log(' - ADMIN:      admin@pharmacy.com      / Admin@1234');
  console.log(' - PHARMACIST: pharmacist@pharmacy.com / Pharm@1234');
  console.log(' - CASHIER:    cashier@pharmacy.com    / Cash@1234');
}

main()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
