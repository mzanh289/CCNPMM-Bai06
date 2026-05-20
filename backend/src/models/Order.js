const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 }
  },
  {
    _id: true
  }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], default: [] },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, required: true },
      note: { type: String, default: '' }
    },
    paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled', 'cancel_requested'],
      default: 'pending'
    },
    subtotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    orderedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Order', orderSchema);
