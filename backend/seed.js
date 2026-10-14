require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/product.model");

const products = [
  // ── Electronics ────────────────────────────────────────────────────────────
  {
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard with Cherry MX Blue switches. Tactile and clicky, perfect for typing and gaming.",
    price: 3499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
    stock: 20,
  },
  {
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with 2.4GHz connectivity, 1600 DPI sensor, and 12-month battery life.",
    price: 1299,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80",
    stock: 35,
  },
  {
    name: "USB-C Hub 7-in-1",
    description: "Expand your laptop with HDMI 4K, 3x USB-A, SD card reader, USB-C PD charging. Plug and play.",
    price: 2199,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=600&q=80",
    stock: 18,
  },
  {
    name: "Noise Cancelling Headphones",
    description: "Over-ear headphones with active noise cancellation, 30-hour battery and foldable design.",
    price: 7999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    stock: 12,
  },
  {
    name: "Portable Bluetooth Speaker",
    description: "360° surround sound, IPX7 waterproof, 20-hour playtime. Take your music everywhere.",
    price: 3299,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
    stock: 25,
  },
  {
    name: "27-inch 4K Monitor",
    description: "IPS panel, 144Hz refresh rate, HDR400, USB-C connectivity. Crystal-clear colours for work and play.",
    price: 28999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&q=80",
    stock: 8,
  },
  {
    name: "Webcam Full HD 1080p",
    description: "Auto-focus webcam with built-in stereo microphone, privacy cover and wide-angle lens.",
    price: 2799,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600&q=80",
    stock: 22,
  },
  {
    name: "Smart LED Desk Lamp",
    description: "Touch-controlled LED lamp with 5 colour temperatures, USB charging port and memory function.",
    price: 1599,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
    stock: 30,
  },

  // ── Books ──────────────────────────────────────────────────────────────────
  {
    name: "Clean Code",
    description: "A handbook of agile software craftsmanship by Robert C. Martin. Essential reading for every developer.",
    price: 699,
    category: "Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
    stock: 50,
  },
  {
    name: "The Pragmatic Programmer",
    description: "From journeyman to master — timeless advice for software professionals by Hunt & Thomas.",
    price: 799,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
    stock: 40,
  },
  {
    name: "Designing Data-Intensive Applications",
    description: "The definitive guide to building reliable, scalable and maintainable systems by Martin Kleppmann.",
    price: 1199,
    category: "Books",
    image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&q=80",
    stock: 30,
  },
  {
    name: "Atomic Habits",
    description: "An easy & proven way to build good habits & break bad ones by James Clear. #1 bestseller.",
    price: 449,
    category: "Books",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80",
    stock: 60,
  },

  // ── Clothing ───────────────────────────────────────────────────────────────
  {
    name: "Classic White T-Shirt",
    description: "100% organic cotton crew-neck tee. Pre-shrunk, breathable and perfect for everyday wear.",
    price: 599,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    stock: 100,
  },
  {
    name: "Slim Fit Chinos",
    description: "Stretch-cotton slim fit chinos available in 6 colours. Wrinkle-resistant and machine washable.",
    price: 1799,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
    stock: 55,
  },
  {
    name: "Hooded Sweatshirt",
    description: "Heavyweight 400 GSM fleece hoodie with kangaroo pocket and adjustable drawstring.",
    price: 1499,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
    stock: 45,
  },
  {
    name: "Running Shorts",
    description: "Lightweight moisture-wicking running shorts with inner liner and zippered pocket.",
    price: 899,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80",
    stock: 70,
  },

  // ── Home & Kitchen ─────────────────────────────────────────────────────────
  {
    name: "Stainless Steel Water Bottle",
    description: "Double-wall vacuum insulated 750ml bottle. Keeps drinks cold 24hrs, hot 12hrs. BPA-free.",
    price: 999,
    category: "Home & Kitchen",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80",
    stock: 80,
  },
  {
    name: "Pour-Over Coffee Set",
    description: "Borosilicate glass pour-over dripper with stainless steel filter and 600ml carafe.",
    price: 1899,
    category: "Home & Kitchen",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    stock: 28,
  },
  {
    name: "Bamboo Cutting Board Set",
    description: "Set of 3 eco-friendly bamboo cutting boards in different sizes. Antibacterial and knife-friendly.",
    price: 1299,
    category: "Home & Kitchen",
    image: "https://images.unsplash.com/photo-1584990347449-a2d4ef05b8c9?w=600&q=80",
    stock: 40,
  },
  {
    name: "Cast Iron Skillet 10-inch",
    description: "Pre-seasoned cast iron skillet for stovetop, oven and campfire cooking. Lasts a lifetime.",
    price: 2499,
    category: "Home & Kitchen",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    stock: 15,
  },

  // ── Sports ─────────────────────────────────────────────────────────────────
  {
    name: "Yoga Mat 6mm",
    description: "Non-slip TPE yoga mat with alignment lines, carrying strap and sweat-resistant surface.",
    price: 1199,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80",
    stock: 50,
  },
  {
    name: "Adjustable Dumbbell Set",
    description: "Space-saving adjustable dumbbells from 2kg to 20kg per hand. Quick-select dial mechanism.",
    price: 8999,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
    stock: 10,
  },
  {
    name: "Jump Rope Speed Cable",
    description: "Ball-bearing speed jump rope with adjustable steel cable. Ideal for HIIT and cardio.",
    price: 599,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80",
    stock: 60,
  },

  // ── Stationery ─────────────────────────────────────────────────────────────
  {
    name: "Dot Grid Notebook A5",
    description: "200-page 100gsm dot grid notebook with lay-flat binding and ribbon bookmark.",
    price: 499,
    category: "Stationery",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80",
    stock: 90,
  },
  {
    name: "Gel Pen Set (12 colours)",
    description: "Smooth-writing 0.7mm gel pens in 12 vibrant colours. Perfect for journaling and note-taking.",
    price: 349,
    category: "Stationery",
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80",
    stock: 120,
  },
  {
    name: "Desk Organiser Bamboo",
    description: "5-compartment bamboo desk organiser for pens, scissors and office supplies. Natural finish.",
    price: 899,
    category: "Stationery",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    stock: 35,
  },

  // ── Personal Care ──────────────────────────────────────────────────────────
  {
    name: "Electric Toothbrush",
    description: "Sonic electric toothbrush with 5 modes, 2-minute timer, and 4-week battery life.",
    price: 1999,
    category: "Personal Care",
    image: "https://images.unsplash.com/photo-1559591937-47e96e6c2d5e?w=600&q=80",
    stock: 25,
  },
  {
    name: "Sunscreen SPF 50+ 100ml",
    description: "Lightweight non-greasy broad-spectrum SPF 50+ sunscreen. Dermatologist tested, reef-safe formula.",
    price: 449,
    category: "Personal Care",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80",
    stock: 75,
  },
  {
    name: "Jade Face Roller",
    description: "Natural jade stone face roller for lymphatic drainage, puffiness reduction and product absorption.",
    price: 699,
    category: "Personal Care",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80",
    stock: 40,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existing = await Product.countDocuments();
    console.log(`Existing products: ${existing}`);

    const inserted = await Product.insertMany(products);
    console.log(`✅ Inserted ${inserted.length} new products successfully`);

    const total = await Product.countDocuments();
    console.log(`Total products in DB: ${total}`);
  } catch (err) {
    console.error("Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();
