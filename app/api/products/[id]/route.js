import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
// We would also need to delete the images from Cloudinary, but we'll skip that for now to keep it simple, 
// or implement it if the user wants. We'll just delete the DB record.

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Server Error', error: error.message },
      { status: 500 }
    );
  }
}
