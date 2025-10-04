// app/api/vouchers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/vouchers:
 * post:
 * summary: Membuat voucher baru
 * description: Menambahkan voucher baru ke dalam database.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * code:
 * type: string
 * discountAmount:
 * type: number
 * discountType:
 * type: string
 * expiryDate:
 * type: string
 * format: date-time
 * isActive:
 * type: boolean
 * responses:
 * 201:
 * description: Voucher berhasil ditambahkan.
 * 400:
 * description: Data tidak lengkap.
 * 500:
 * description: Gagal menambahkan voucher.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, discountAmount, discountType, expiryDate, isActive } = body;

    if (!code || !discountAmount || !discountType) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    // Ubah V menjadi v
    const newVoucher = await prisma.voucher.create({
      data: {
        code,
        discountAmount: parseFloat(discountAmount),
        discountType,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive,
      },
    });

    return NextResponse.json(newVoucher, { status: 201 });
  } catch (error) {
    console.error('Error creating voucher:', error);
    return NextResponse.json({ message: 'Gagal menambahkan voucher' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/vouchers:
 * get:
 * summary: Mengambil semua voucher
 * description: Mengembalikan daftar semua voucher yang ada di database.
 * responses:
 * 200:
 * description: Berhasil mengambil data voucher.
 * 500:
 * description: Gagal mengambil data voucher.
 */
export async function GET() {
  try {
    // Ubah V menjadi v
    const vouchers = await prisma.voucher.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(vouchers, { status: 200 });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json({ message: 'Gagal mengambil data voucher' }, { status: 500 });
  }
}