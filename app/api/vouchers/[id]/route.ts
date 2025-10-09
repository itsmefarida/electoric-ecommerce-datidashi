import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Status error code unik (Unique constraint failed) di Prisma
const PRISMA_ERROR_UNIQUE_CONSTRAINT = 'P2002'; 

/**
 * @swagger
 * /api/vouchers/{id}:
 * get:
 * summary: Retrieves a single voucher by ID
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Successfully retrieved voucher data.
 * 404:
 * description: Voucher not found.
 * 500:
 * description: Failed to retrieve voucher data due to server error.
 */
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      return NextResponse.json({ message: 'Voucher not found' }, { status: 404 });
    }
    return NextResponse.json(voucher, { status: 200 });
  } catch (error) {
    console.error("GET Voucher Error:", error);
    return NextResponse.json({ message: 'Failed to retrieve voucher data' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/vouchers/{id}:
 * patch:
 * summary: Updates a voucher by ID
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
 * description: Voucher successfully updated.
 * 409:
 * description: Conflict, likely due to a duplicate voucher code.
 * 500:
 * description: Failed to update voucher due to server error.
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
    if (error instanceof PrismaClientKnownRequestError && error.code === PRISMA_ERROR_UNIQUE_CONSTRAINT) {
        // Error P2002: Unique constraint failed (kode duplikat)
        return NextResponse.json({ message: 'Conflict: Voucher code must be unique.' }, { status: 409 });
    }
    console.error('Failed to update voucher:', error);
    return NextResponse.json({ message: 'Failed to update voucher due to a server error.' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/vouchers/{id}:
 * delete:
 * summary: Deletes a voucher by ID
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Voucher successfully deleted.
 * 500:
 * description: Failed to delete voucher due to server error.
 */
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
    await prisma.voucher.delete({ where: { id } });
    return NextResponse.json({ message: 'Voucher successfully deleted' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete voucher:', error);
    return NextResponse.json({ message: 'Failed to delete voucher due to a server error.' }, { status: 500 });
  }
}
