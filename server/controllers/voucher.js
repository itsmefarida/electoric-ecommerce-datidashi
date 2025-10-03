const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mendapatkan semua voucher
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await prisma.voucher.findMany();
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vouchers', error });
  }
};

// Membuat voucher baru
exports.createVoucher = async (req, res) => {
  const { code, discountAmount, discountType, expiryDate, isActive } = req.body;
  try {
    const newVoucher = await prisma.voucher.create({
      data: { code, discountAmount, discountType, expiryDate, isActive },
    });
    res.status(201).json(newVoucher);
  } catch (error) {
    res.status(500).json({ message: 'Error creating voucher', error });
  }
};

// Memperbarui voucher
exports.updateVoucher = async (req, res) => {
  const { id } = req.params;
  const { code, discountAmount, discountType, expiryDate, isActive } = req.body;
  try {
    const updatedVoucher = await prisma.voucher.update({
      where: { id },
      data: { code, discountAmount, discountType, expiryDate, isActive },
    });
    res.status(200).json(updatedVoucher);
  } catch (error) {
    res.status(500).json({ message: 'Error updating voucher', error });
  }
};

// Menghapus voucher
exports.deleteVoucher = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.voucher.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting voucher', error });
  }
};