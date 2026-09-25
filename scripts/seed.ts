/**
 * @file seed.ts
 * @description Seeds initial categories, hardware catalog products, admin owner account,
 * and a sample customer account into MongoDB for Malik Hardware Mart.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Category from '../src/models/Category';
import Product from '../src/models/Product';
import User from '../src/models/User';
import Cart from '../src/models/Cart';
import Order from '../src/models/Order';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/malik_hardware_mart';

/**
 * Main seeding execution function.
 * Connects to MongoDB, clears test collections, and populates baseline catalog data.
 */
async function seedDatabase(): Promise<void> {
  console.log('Connecting to database:', MONGODB_URI);
  // Establish connection to local MongoDB
  await mongoose.connect(MONGODB_URI);

  // Clear existing collections to ensure idempotent, clean seed run
  console.log('Cleaning existing database collections...');
  await Category.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({});
  await Cart.deleteMany({});
  await Order.deleteMany({});

  // 1. Seed Categories with local placeholder image fallbacks per Section 5
  console.log('Seeding categories...');
  const categoryDocs = [
    {
      name: 'Hand & Power Tools',
      slug: 'hand-power-tools',
      placeholderImage: '/images/products/category-tools.png',
      description: 'Industrial grade electric power tools, pneumatic equipment, and precision manual hand tools.',
    },
    {
      name: 'Fasteners & Fixings',
      slug: 'fasteners-fixings',
      placeholderImage: '/images/products/category-fasteners.png',
      description: 'High tensile bolts, anchors, metric nuts, threaded rods, and construction grade screws.',
    },
    {
      name: 'Electrical & Lighting',
      slug: 'electrical-lighting',
      placeholderImage: '/images/products/category-electrical.png',
      description: 'Armoured copper cables, industrial switchgear, MCBs, junction boxes, and work lights.',
    },
    {
      name: 'Plumbing & Pipes',
      slug: 'plumbing-pipes',
      placeholderImage: '/images/products/category-plumbing.png',
      description: 'Heavy duty brass valves, CPVC/UPVC pipe fittings, industrial flanges, and flow meters.',
    },
    {
      name: 'Architectural Hardware',
      slug: 'architectural-hardware',
      placeholderImage: '/images/products/category-hardware.png',
      description: 'Commercial door closers, mortise deadbolts, brass hinges, handles, and panic exit bars.',
    },
    {
      name: 'Paints & Chemicals',
      slug: 'paints-chemicals',
      placeholderImage: '/images/products/category-paints.png',
      description: 'Heavy duty epoxy coatings, rust converters, polyurethanes, primers, and structural sealants.',
    },
    {
      name: 'Safety & Workwear',
      slug: 'safety-workwear',
      placeholderImage: '/images/products/category-safety.png',
      description: 'CE and ISI certified safety helmets, high-visibility jackets, harness sets, and protective footwear.',
    },
  ];

  // Insert categories into MongoDB
  const createdCategories = await Category.insertMany(categoryDocs);
  console.log(`Created ${createdCategories.length} categories.`);

  // Create a map from slug to Category ObjectId for product references
  const catMap = new Map<string, mongoose.Types.ObjectId>();
  for (const cat of createdCategories) {
    catMap.set(cat.slug, cat._id as mongoose.Types.ObjectId);
  }

  // 2. Seed Products
  console.log('Seeding products...');
  const productDocs = [
    {
      name: 'Bosch Professional Rotary Hammer Drill GBH 2-26 DRE (800W)',
      slug: 'bosch-rotary-hammer-drill-gbh-2-26-dre',
      category: catMap.get('hand-power-tools'),
      brand: 'Bosch',
      description: 'High drilling rate and 30% higher chiseling performance than other hammer drills in the entry-level class. Features rotating brush plate for equal power in forward and reverse rotation.',
      specs: [
        { key: 'Power Input', value: '800 W' },
        { key: 'Impact Energy', value: '2.7 Joules' },
        { key: 'Max Drilling Dia. (Concrete)', value: '26 mm' },
        { key: 'Weight', value: '2.8 kg' },
        { key: 'Tool Holder', value: 'SDS-plus' },
      ],
      imageUrl: null, // Null to trigger Section 5 fallback to category-tools.png / default-product.png
      // PRICE GATE: do not send price to unauthenticated requests
      price: 8450, // INR trade wholesale price
      stockStatus: 'in_stock',
      featured: true,
    },
    {
      name: 'Stanley 14-Piece Heavy Duty Combination Spanner Set (10-32mm)',
      slug: 'stanley-combination-spanner-set-14pc',
      category: catMap.get('hand-power-tools'),
      brand: 'Stanley',
      description: 'Forged from high grade Chrome Vanadium steel with Maxi-Drive profile to prevent fastener rounding. Full mirror chrome finish provides rust protection and quick clean up.',
      specs: [
        { key: 'Pieces Count', value: '14 Spanners' },
        { key: 'Sizes Included', value: '10, 11, 12, 13, 14, 17, 19, 21, 22, 24, 27, 30, 32 mm' },
        { key: 'Material', value: 'Chrome Vanadium (Cr-V)' },
        { key: 'Standard', value: 'DIN 3113' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 2650,
      stockStatus: 'in_stock',
      featured: true,
    },
    {
      name: 'Taparia Heavy Duty Cast Steel Pipe Wrench 14 Inch / 350mm',
      slug: 'taparia-pipe-wrench-14-inch',
      category: catMap.get('hand-power-tools'),
      brand: 'Taparia',
      description: 'Induction hardened teeth ensure slip-proof grip on galvanized pipes and round fittings. Precision machined scroll thread ensures smooth jaw adjustment.',
      specs: [
        { key: 'Length', value: '14 Inch (350 mm)' },
        { key: 'Jaw Capacity', value: '60 mm' },
        { key: 'Handle Material', value: 'Ductile Cast Iron' },
        { key: 'Standard', value: 'IS 4003 Part 1' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 890,
      stockStatus: 'in_stock',
      featured: false,
    },
    {
      name: 'Malik Forge Grade 8.8 High Tensile Hex Bolts M12 x 50mm (Pack of 100)',
      slug: 'malik-forge-grade-8-8-hex-bolts-m12x50-100pk',
      category: catMap.get('fasteners-fixings'),
      brand: 'Malik Forge',
      description: 'Cold forged high tensile carbon steel structural bolts with black phosphate oil finish. Ideal for steel fabrication, crane bases, and machinery frames.',
      specs: [
        { key: 'Grade', value: 'High Tensile 8.8' },
        { key: 'Thread Size', value: 'M12 x 1.75 pitch' },
        { key: 'Nominal Length', value: '50 mm' },
        { key: 'Coating', value: 'Black Oxide / Phosphated' },
        { key: 'Standard', value: 'ISO 4017 / DIN 933' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 1450,
      stockStatus: 'in_stock',
      featured: true,
    },
    {
      name: 'Fischer High Performance Nylon Wall Anchors DuoPower 8x40 (Box of 100)',
      slug: 'fischer-duopower-wall-anchors-8x40',
      category: catMap.get('fasteners-fixings'),
      brand: 'Fischer',
      description: 'Two component nylon wall plug combining folding, expanding, and knotting mechanisms depending on substrate. Operates reliably in concrete, brick, and drywall.',
      specs: [
        { key: 'Drill Hole Dia.', value: '8 mm' },
        { key: 'Anchor Length', value: '40 mm' },
        { key: 'Screw Size Match', value: '4.5 - 6.0 mm' },
        { key: 'Substrate Compatibility', value: 'Concrete, Solid Brick, Aerated Concrete' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 680,
      stockStatus: 'in_stock',
      featured: false,
    },
    {
      name: 'Stainless Steel SS-304 Self-Drilling Screws #10 x 1-1/2 Inch (Pack of 500)',
      slug: 'ss-304-self-drilling-screws-10x1-5',
      category: catMap.get('fasteners-fixings'),
      brand: 'Malik Fasteners',
      description: 'Hex washer head self-drilling tek screws manufactured from Austenitic SS-304. Designed for solar frame mounting and exterior sheet metal cladding.',
      specs: [
        { key: 'Material Grade', value: 'Stainless Steel AISI 304' },
        { key: 'Screw Gauge', value: '#10 (4.8 mm)' },
        { key: 'Length', value: '1.5 Inch (38 mm)' },
        { key: 'Head Style', value: 'Hex Washer Head with EPDM Gasket' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 1950,
      stockStatus: 'in_stock',
      featured: true,
    },
    {
      name: 'Havells Industrial 3-Pole C-Curve Miniature Circuit Breaker (MCB) 32A',
      slug: 'havells-mcb-3-pole-32a-c-curve',
      category: catMap.get('electrical-lighting'),
      brand: 'Havells',
      description: 'Euroline series 10kA breaking capacity 3-pole MCB with bi-connect terminals. Provides thermal-magnetic trip protection for heavy commercial motors and shopfloors.',
      specs: [
        { key: 'Rated Current', value: '32 Ampere' },
        { key: 'Number of Poles', value: '3 Pole (TP)' },
        { key: 'Breaking Capacity', value: '10 kA' },
        { key: 'Tripping Curve', value: 'C-Curve' },
        { key: 'Rated Voltage', value: '415V AC' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 1820,
      stockStatus: 'in_stock',
      featured: true,
    },
    {
      name: 'Polycab 2.5 sq mm Single Core FRLS Copper Building Wire (90m Red Coil)',
      slug: 'polycab-2-5-sqmm-frls-copper-wire-90m',
      category: catMap.get('electrical-lighting'),
      brand: 'Polycab',
      description: 'Flame Retardant Low Smoke (FRLS) 100% electrolytic grade multi-strand annealed copper conductor. Certified for 1100V grade industrial power supply lines.',
      specs: [
        { key: 'Cross Section Area', value: '2.5 sq mm' },
        { key: 'Length', value: '90 Metres Coil' },
        { key: 'Insulation', value: 'Flame Retardant Low Smoke (FRLS) PVC' },
        { key: 'Conductor', value: 'Electrolytic Plain Annealed Copper' },
        { key: 'Voltage Rating', value: '1100 V' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 2980,
      stockStatus: 'in_stock',
      featured: false,
    },
    {
      name: 'Supreme Industrial High Pressure CPVC Ball Valve 2 Inch (50mm)',
      slug: 'supreme-cpvc-ball-valve-2-inch',
      category: catMap.get('plumbing-pipes'),
      brand: 'Supreme',
      description: 'Heavy duty quarter-turn solvent-weld CPVC ball valve rated for SDR-11 hot and cold chemical and water lines. Chemical resistant PTFE seat seals ensure leak-proof shutoff.',
      specs: [
        { key: 'Nominal Size', value: '2 Inch (50 mm)' },
        { key: 'Body Material', value: 'Chlorinated Polyvinyl Chloride (CPVC)' },
        { key: 'Pressure Rating', value: 'PN 16 (16 Bar at 23°C)' },
        { key: 'End Connection', value: 'Solvent Cement Socket End' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 1650,
      stockStatus: 'in_stock',
      featured: true,
    },
    {
      name: 'Zoloto Heavy Duty Bronze Gate Valve Class-1 Screwed 1-1/2 Inch',
      slug: 'zoloto-bronze-gate-valve-1-5-inch',
      category: catMap.get('plumbing-pipes'),
      brand: 'Zoloto',
      description: 'Screwed in bonnet, inside screw, non-rising stem bronze gate valve with integral seat. Suitable for steam, industrial fluids, and water supply lines.',
      specs: [
        { key: 'Size', value: '1-1/2 Inch (40 mm)' },
        { key: 'Body Material', value: 'Bronze (IS 318 Gr. LTB 2)' },
        { key: 'Hydrostatic Test Body', value: '24 Bar' },
        { key: 'End Connection', value: 'Female BSP Threads' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 3450,
      stockStatus: 'in_stock',
      featured: false,
    },
    {
      name: 'Godrej Ultra Tribolt Heavy Duty Rim Deadbolt Door Lock (Brass Antique)',
      slug: 'godrej-ultra-tribolt-rim-deadbolt-lock',
      category: catMap.get('architectural-hardware'),
      brand: 'Godrej',
      description: 'High security 3-bolt reinforced rim lock engineered for 30mm to 85mm main entrance timber doors. Includes 4 computerized dimple keys with anti-pick mechanism.',
      specs: [
        { key: 'Deadbolts', value: '3 Solid Extruded Brass Bolts' },
        { key: 'Finish', value: 'Antique Brass PVD' },
        { key: 'Door Thickness', value: '30 mm - 85 mm' },
        { key: 'Key Technology', value: 'Ultra Dimple Key with 10 Cr. combinations' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 3890,
      stockStatus: 'in_stock',
      featured: true,
    },
    {
      name: 'Malik Forge Stainless Steel SS-304 Heavy Ball Bearing Butt Hinges 4"x3"x3mm (Pair)',
      slug: 'malik-forge-ss-304-ball-bearing-butt-hinges-4x3',
      category: catMap.get('architectural-hardware'),
      brand: 'Malik Forge',
      description: 'Architectural grade dual ball-bearing butt hinges crafted from AISI 304 solid stainless steel. Tested for 200,000 continuous door opening cycles.',
      specs: [
        { key: 'Dimensions', value: '100 mm x 75 mm x 3 mm' },
        { key: 'Material', value: 'AISI 304 Stainless Steel' },
        { key: 'Bearings', value: '2 Precision Sealed Ball Bearings' },
        { key: 'Weight Capacity', value: 'Up to 80 kg per pair' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 480,
      stockStatus: 'in_stock',
      featured: false,
    },
    {
      name: '3M Heavy Duty Industrial Protective Safety Helmet with 4-Point Suspension',
      slug: '3m-industrial-safety-helmet-h-700',
      category: catMap.get('safety-workwear'),
      brand: '3M',
      description: 'High-density polyethylene shell engineered with low-profile design for superior stability and impact protection. Features ratchet suspension for rapid fit adjustment.',
      specs: [
        { key: 'Material', value: 'High Density Polyethylene (HDPE)' },
        { key: 'Certification', value: 'ANSI/ISEA Z89.1 Type 1, Class C, G, E' },
        { key: 'Suspension', value: '4-Point Ratchet Suspension' },
        { key: 'Ventilation', value: 'Non-vented electrical protection' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 720,
      stockStatus: 'in_stock',
      featured: true,
    },
    {
      name: 'Karam Full Body Fall Arrest Safety Harness with Double Lanyard & Scaffold Hooks',
      slug: 'karam-full-body-safety-harness-double-lanyard',
      category: catMap.get('safety-workwear'),
      brand: 'Karam',
      description: 'High strength 44mm polyester webbing full body harness with dorsal D-ring and dual 1.8m energy absorbing fall arrest lanyards with scaffold snap hooks.',
      specs: [
        { key: 'Standard', value: 'EN 361:2002 & IS 3521:1999' },
        { key: 'Webbing Width', value: '44 mm High Tenacity Polyester' },
        { key: 'Attachment Points', value: '1 Dorsal D-Ring' },
        { key: 'Lanyard', value: 'Twin 1.8m Rope with Energy Absorber' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 2450,
      stockStatus: 'in_stock',
      featured: false,
    },
    {
      name: 'Asian Paints Industrial Epoxy Floor Coating Apcoflor HFP 400 (4 Litre Pack)',
      slug: 'asian-paints-epoxy-floor-coating-apcoflor-4l',
      category: catMap.get('paints-chemicals'),
      brand: 'Asian Paints',
      description: 'Two-pack solventless high build epoxy floor topcoat designed for heavy industrial foot and forklift traffic. Resists motor oils, dilute acids, and shop chemicals.',
      specs: [
        { key: 'Pack Size', value: '4 Litres (Base + Hardener)' },
        { key: 'Finish', value: 'High Gloss Seamless Surface' },
        { key: 'Recommended Thickness', value: '300 - 500 microns' },
        { key: 'Pot Life', value: '45 minutes at 30°C' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 3600,
      stockStatus: 'in_stock',
      featured: true,
    },
    {
      name: 'Bostik Heavy Duty Polyurethane Construction Joint Sealant PU-900 (600ml Sausage)',
      slug: 'bostik-pu-construction-sealant-600ml',
      category: catMap.get('paints-chemicals'),
      brand: 'Bostik',
      description: 'One-component moisture curing polyurethane sealant with high movement capability (±25%). Excellent adhesion to concrete, brick, steel, and aluminium without primer.',
      specs: [
        { key: 'Volume', value: '600 ml Foil Sausage' },
        { key: 'Polymer Base', value: 'Polyurethane' },
        { key: 'Movement Accommodation', value: '±25%' },
        { key: 'Shore A Hardness', value: '30 - 35' },
      ],
      imageUrl: null,
      // PRICE GATE: do not send price to unauthenticated requests
      price: 520,
      stockStatus: 'in_stock',
      featured: false,
    },
  ];

  // Insert products into MongoDB
  const createdProducts = await Product.insertMany(productDocs);
  console.log(`Created ${createdProducts.length} catalog products.`);

  // 3. Seed Admin, Verified Customer, and Pending Customer Users
  console.log('Seeding initial users...');

  // Salt and hash passwords using 10 bcrypt rounds
  const adminPasswordHash = await bcrypt.hash('AdminMalikHardware#2026', 10);
  const customerPasswordHash = await bcrypt.hash('CustomerPass#2026', 10);
  const pendingPasswordHash = await bcrypt.hash('PendingPass#2026', 10);

  // Admin user (always price verified)
  const adminUser = await User.create({
    name: 'Malik Store Owner',
    email: 'admin@malikhardware.com',
    passwordHash: adminPasswordHash,
    role: 'admin',
    isPriceVerified: true,
    phone: '+91 98765 43210',
    addresses: [
      {
        fullName: 'Malik Hardware Mart Headquarters',
        phone: '+91 98765 43210',
        street: '124 G.T. Road, Industrial Hardware Hub',
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110006',
        country: 'India',
        isDefault: true,
      },
    ],
  });

  // Verified Customer user (approved trade pricing)
  const customerUser = await User.create({
    name: 'Rajesh Sharma (Sharma Builders)',
    email: 'customer@sharmabuilders.com',
    passwordHash: customerPasswordHash,
    role: 'customer',
    isPriceVerified: true,
    phone: '+91 98111 22334',
    addresses: [
      {
        fullName: 'Rajesh Sharma',
        phone: '+91 98111 22334',
        street: 'Plot 42, Okhla Industrial Area Phase III',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110020',
        country: 'India',
        isDefault: true,
      },
    ],
  });

  // Pending Customer user (awaiting admin rate verification)
  const pendingCustomerUser = await User.create({
    name: 'Vikas Verma (Verma Fabricators)',
    email: 'pending@contractor.com',
    passwordHash: pendingPasswordHash,
    role: 'customer',
    isPriceVerified: false,
    phone: '+91 98222 33445',
    addresses: [
      {
        fullName: 'Vikas Verma',
        phone: '+91 98222 33445',
        street: 'Shed 19, Mayapuri Industrial Area Phase II',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110064',
        country: 'India',
        isDefault: true,
      },
    ],
  });

  // 4. Seed an initial persistent cart for the demo customer to demonstrate cart persistence
  console.log('Seeding initial persistent cart for customer...');
  await Cart.create({
    userId: customerUser._id,
    items: [
      {
        productId: createdProducts[0]._id, // Bosch Rotary Hammer
        quantity: 1,
        priceAtAdd: createdProducts[0].price,
      },
      {
        productId: createdProducts[3]._id, // Malik Forge Hex Bolts
        quantity: 2,
        priceAtAdd: createdProducts[3].price,
      },
    ],
  });

  // 5. Seed a sample historic order for the demo customer to verify /orders view
  console.log('Seeding sample order history...');
  await Order.create({
    userId: customerUser._id,
    items: [
      {
        productId: createdProducts[1]._id,
        name: createdProducts[1].name,
        quantity: 1,
        priceAtOrder: createdProducts[1].price,
      },
      {
        productId: createdProducts[6]._id,
        name: createdProducts[6].name,
        quantity: 2,
        priceAtOrder: createdProducts[6].price,
      },
    ],
    shippingAddress: {
      fullName: 'Rajesh Sharma',
      phone: '+91 98111 22334',
      street: 'Plot 42, Okhla Industrial Area Phase III',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110020',
      country: 'India',
    },
    status: 'delivered',
    totalAmount: createdProducts[1].price * 1 + createdProducts[6].price * 2,
    paymentMethod: 'Cash on Delivery / Offline Trade Credit',
    paymentStatus: 'completed',
    notes: 'Sample historical delivered order for testing',
  });

  console.log('Database seeded successfully!');
  console.log('--------------------------------------------------');
  console.log('Admin Account:        admin@malikhardware.com / AdminMalikHardware#2026 (Full Access)');
  console.log('Verified Contractor:  customer@sharmabuilders.com / CustomerPass#2026 (Price Verified)');
  console.log('Pending Contractor:   pending@contractor.com / PendingPass#2026 (Pending Verification)');
  console.log('--------------------------------------------------');

  // Disconnect cleanly from MongoDB
  await mongoose.disconnect();
}

// Execute seed script
seedDatabase().catch((err) => {
  console.error('Database seeding failed:', err);
  process.exit(1);
});
