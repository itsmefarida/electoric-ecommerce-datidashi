// app/api/vouchers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/vouchers/{id}:
 * get:
 * summary: Mengambil satu voucher berdasarkan ID
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Berhasil mengambil data voucher.
 * 404:
 * description: Voucher tidak ditemukan.
 * 500:
 * description: Gagal mengambil data voucher.
 */
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      return NextResponse.json({ message: 'Voucher tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json(voucher, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data voucher' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/vouchers/{id}:
 * patch:
 * summary: Memperbarui voucher berdasarkan ID
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
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
 * 200:
 * description: Voucher berhasil diperbarui.
 * 500:
 * description: Gagal memperbarui voucher.
 */
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  const body = await req.json();
  const { code, discountAmount, discountType, expiryDate, isActive } = body;

  try {
    const updatedVoucher = await prisma.voucher.update({
      where: { id },
      data: {
        code,
        discountAmount: parseFloat(discountAmount),
        discountType,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive,
      },
    });
    return NextResponse.json(updatedVoucher, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui voucher' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/vouchers/{id}:
 * delete:
 * summary: Menghapus voucher berdasarkan ID
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Voucher berhasil dihapus.
 * 500:
 * description: Gagal menghapus voucher.
 */
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
    await prisma.voucher.delete({ where: { id } });
    return NextResponse.json({ message: 'Voucher berhasil dihapus' }, { status: 200 });
  } catch (error) {
    console.error('Gagal menghapus voucher:', error);
    return NextResponse.json({ message: 'Gagal menghapus voucher' }, { status: 500 });
  }
}