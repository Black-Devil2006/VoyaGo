const Order = require("../models/Order");

const getProducts = (req, res) => {
  const products = global.inMemoryDb.products;
  const { category, search } = req.query;

  let filtered = [...products];
  if (category && category !== "All") {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }

  res.status(200).json({ products: filtered });
};

const placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, paymentMethod } = req.body;
    const userId = req.user ? req.user.id : "usr_demo";

    const orderObj = {
      _id: "ord_" + Date.now(),
      userId,
      items: items || [],
      totalAmount: Number(totalAmount) || 250,
      paymentMethod: paymentMethod || "VoyaPay Wallet",
      deliveryAddress: deliveryAddress || "102, Green View Apts, Bandra, Mumbai",
      status: "Dispatched",
      createdAt: new Date()
    };

    try {
      const newOrder = await Order.create(orderObj);
      return res.status(201).json({ message: "Grocery order placed successfully!", order: newOrder });
    } catch (e) {
      global.inMemoryDb.orders.unshift(orderObj);
      return res.status(201).json({ message: "Grocery order placed successfully!", order: orderObj });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to place grocery order" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : "usr_demo";
    let orders = [];
    try {
      orders = await Order.find({ userId }).sort({ createdAt: -1 });
    } catch (e) {
      orders = (global.inMemoryDb.orders || []).filter(o => String(o.userId) === String(userId));
    }

    if (!orders || orders.length === 0) {
      orders = [
        {
          _id: "ord_101",
          items: [{ name: "Fresh Apples (1kg)", quantity: 1, price: 180 }, { name: "Organic Milk (1L)", quantity: 2, price: 130 }],
          totalAmount: 310,
          paymentMethod: "VoyaPay Wallet",
          deliveryAddress: "102 Green Park, Bandra",
          status: "Delivered",
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    }

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = {
  getProducts,
  placeOrder,
  getUserOrders
};
