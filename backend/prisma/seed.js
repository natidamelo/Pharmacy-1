"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    // 1. Create a Branch record
    const branch = await prisma.branch.upsert({
        where: { name: 'Main Branch' },
        update: {},
        create: {
            name: 'Main Branch',
            location: 'Addis Ababa',
        },
    });
    // 2. Create default Settings
    const settings = [
        { key: 'currency', value: 'ETB' },
        { key: 'taxRate', value: '0.15' },
        { key: 'branchName', value: 'Main Branch' },
        { key: 'expiryAlertDays', value: '30' },
    ];
    for (const s of settings) {
        await prisma.settings.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: { key: s.key, value: s.value },
        });
    }
    // 3. Create users
    const users = [
        { name: 'Admin', email: 'admin@pharmacy.com', password: 'Admin@1234', role: 'ADMIN' },
        { name: 'Pharmacist', email: 'pharmacist@pharmacy.com', password: 'Pharm@1234', role: 'PHARMACIST' },
        { name: 'Cashier', email: 'cashier@pharmacy.com', password: 'Cash@1234', role: 'CASHIER' },
    ];
    for (const u of users) {
        const passwordHash = await bcryptjs_1.default.hash(u.password, 12);
        await prisma.user.upsert({
            where: { email: u.email },
            update: {
                passwordHash,
                role: u.role,
            },
            create: {
                name: u.name,
                email: u.email,
                passwordHash,
                role: u.role,
                active: true,
            },
        });
    }
    // 4. Create 3 categories
    const categories = [
        { name: 'Antibiotics' },
        { name: 'Analgesics' },
        { name: 'Vitamins & Supplements' },
    ];
    for (const c of categories) {
        await prisma.category.upsert({
            where: { name: c.name },
            update: {},
            create: { name: c.name },
        });
    }
    // 5. Create 3 products
    const antibioticsCat = await prisma.category.findFirst({ where: { name: 'Antibiotics' } });
    const analgesicsCat = await prisma.category.findFirst({ where: { name: 'Analgesics' } });
    const vitaminsCat = await prisma.category.findFirst({ where: { name: 'Vitamins & Supplements' } });
    const products = [
        {
            name: 'Amoxicillin 500mg',
            barcode: '6012345678901',
            categoryId: antibioticsCat.id,
            dosageForm: 'CAPSULE',
            unitOfMeasure: 'Box',
            defaultSellingPrice: 150.0,
            requiresPrescription: true,
            reorderLevel: 50,
        },
        {
            name: 'Paracetamol 500mg',
            barcode: '6012345678902',
            categoryId: analgesicsCat.id,
            dosageForm: 'TABLET',
            unitOfMeasure: 'Box',
            defaultSellingPrice: 50.0,
            requiresPrescription: false,
            reorderLevel: 100,
        },
        {
            name: 'Vitamin C 1000mg',
            barcode: '6012345678903',
            categoryId: vitaminsCat.id,
            dosageForm: 'TABLET',
            unitOfMeasure: 'Bottle',
            defaultSellingPrice: 200.0,
            requiresPrescription: false,
            reorderLevel: 30,
        },
    ];
    for (const p of products) {
        await prisma.product.upsert({
            where: { barcode: p.barcode },
            update: {},
            create: p,
        });
    }
    // 6. Create 1 supplier
    const supplier = await prisma.supplier.upsert({
        where: { name: 'Addis Pharma Distributors' },
        update: {},
        create: {
            name: 'Addis Pharma Distributors',
            contactPerson: 'John Doe',
            phone: '0911223344',
        },
    });
    // 7. Create batches & 8. Create StockMovements
    const amox = await prisma.product.findUnique({ where: { barcode: '6012345678901' } });
    const para = await prisma.product.findUnique({ where: { barcode: '6012345678902' } });
    const vitc = await prisma.product.findUnique({ where: { barcode: '6012345678903' } });
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@pharmacy.com' } });
    const now = new Date();
    // Helper to safely create batch if it doesn't exist
    const createBatch = async (batchNumber, productId, qty, expiryOffset, cost, sell) => {
        let batch = await prisma.batch.findFirst({ where: { batchNumber, productId } });
        if (!batch) {
            batch = await prisma.batch.create({
                data: {
                    productId,
                    batchNumber,
                    expiryDate: new Date(now.getTime() + expiryOffset),
                    quantityOnHand: qty,
                    costPrice: cost,
                    sellingPrice: sell,
                    supplierId: supplier.id,
                }
            });
            await prisma.stockMovement.create({
                data: {
                    productId,
                    batchId: batch.id,
                    type: 'PURCHASE_IN',
                    quantity: qty,
                    performedBy: adminUser.id,
                    reason: 'Initial seed stock',
                }
            });
        }
    };
    await createBatch('B-AMX-001', amox.id, 200, 2 * 365 * 24 * 60 * 60 * 1000, 100.0, 150.0);
    await createBatch('B-PAR-001', para.id, 500, 8 * 30 * 24 * 60 * 60 * 1000, 30.0, 50.0);
    await createBatch('B-VIT-001', vitc.id, 8, 3 * 30 * 24 * 60 * 60 * 1000, 120.0, 200.0);
    console.log('Seeding complete!');
    console.log('Credentials:');
    console.log('Admin:', 'admin@pharmacy.com', '/', 'Admin@1234');
    console.log('Pharmacist:', 'pharmacist@pharmacy.com', '/', 'Pharm@1234');
    console.log('Cashier:', 'cashier@pharmacy.com', '/', 'Cash@1234');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map