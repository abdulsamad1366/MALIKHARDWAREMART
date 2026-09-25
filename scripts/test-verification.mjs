/**
 * @file test-verification.mjs
 * @description Comprehensive automated test suite verifying all milestones,
 * functional specifications, and strict server-side price-gating security rules:
 * - Public category catalogue
 * - Guest price gating (server-side strip)
 * - Pending trade customer (logged-in, but unverified -> price stripped & cart/checkout blocked)
 * - Admin customer verification flow (1-click approve & live DB reflection without re-login)
 * - Verified trade customer price unlocking & persistent cart & checkout
 * - Admin role guards & order fulfillment operations
 */

const BASE_URL = 'http://localhost:3000';

/**
 * Helper to extract Set-Cookie header value.
 */
function extractCookie(res) {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return '';
  return setCookie.split(';')[0];
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('STARTING MALIK HARDWARE MART VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Public Categories API
  console.log('--- TEST 1: Public Categories API ---');
  const catRes = await fetch(`${BASE_URL}/api/categories`);
  const catData = await catRes.json();
  assert(catRes.status === 200, 'Categories endpoint returns 200 OK');
  assert(catData.categories && catData.categories.length === 7, 'All 7 hardware divisions returned');

  // TEST 2: Price Gating for Guests (Section 7 Security Requirement)
  console.log('\n--- TEST 2: Guest Price Gating Security Check ---');
  const guestProdsRes = await fetch(`${BASE_URL}/api/products`);
  const guestProdsData = await guestProdsRes.json();
  assert(guestProdsRes.status === 200, 'Guest products endpoint returns 200 OK');
  assert(guestProdsData.isAuthenticated === false, 'Guest is identified as unauthenticated');

  const leakedPrice = guestProdsData.products.some((p) => 'price' in p);
  assert(!leakedPrice, 'PRICE GATE: Zero products contain price field in guest response payload');

  const guestSingleRes = await fetch(`${BASE_URL}/api/products/bosch-rotary-hammer-drill-gbh-2-26-dre`);
  const guestSingleData = await guestSingleRes.json();
  assert(!('price' in guestSingleData.product), 'PRICE GATE: Product detail response omits price field for guest');

  // TEST 3: Pending Trade Account Login (isPriceVerified: false)
  console.log('\n--- TEST 3: Pending Trade Account (Unverified) ---');
  const pendingLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'pending@contractor.com',
      password: 'PendingPass#2026',
    }),
  });
  const pendingLoginData = await pendingLoginRes.json();
  const pendingCookie = extractCookie(pendingLoginRes);

  assert(pendingLoginRes.status === 200, 'Pending contractor login succeeded with 200 OK');
  assert(pendingLoginData.user.isPriceVerified === false, 'User account is registered with isPriceVerified: false');

  // Verify prices are STRIPPED for logged-in but unverified user
  const pendingProdsRes = await fetch(`${BASE_URL}/api/products`, {
    headers: { Cookie: pendingCookie },
  });
  const pendingProdsData = await pendingProdsRes.json();
  assert(pendingProdsData.isAuthenticated === true, 'Pending user recognized as authenticated');
  assert(pendingProdsData.isPriceVerified === false, 'Pending user recognized as NOT price verified');
  const pendingLeakedPrice = pendingProdsData.products.some((p) => 'price' in p);
  assert(!pendingLeakedPrice, 'PRICE GATE: Pending user is DENIED prices on catalog list');

  const pendingSingleRes = await fetch(`${BASE_URL}/api/products/bosch-rotary-hammer-drill-gbh-2-26-dre`, {
    headers: { Cookie: pendingCookie },
  });
  const pendingSingleData = await pendingSingleRes.json();
  assert(!('price' in pendingSingleData.product), 'PRICE GATE: Pending user is DENIED price on product detail');

  // Verify Cart and Checkout are strictly BLOCKED (403 Forbidden) for unverified user
  const pendingCartRes = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: pendingCookie },
    body: JSON.stringify({ productId: pendingSingleData.product._id, quantity: 1 }),
  });
  assert(pendingCartRes.status === 403, 'PRICE GATE: Pending user cannot add items to cart (403 Forbidden)');

  const pendingCheckoutRes = await fetch(`${BASE_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: pendingCookie },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Pending Contractor Site',
        phone: '+91 98111 22334',
        street: 'Site Road',
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110020',
        country: 'India',
      },
    }),
  });
  assert(pendingCheckoutRes.status === 403, 'PRICE GATE: Pending user cannot checkout (403 Forbidden)');

  // TEST 4: Admin Verification of Trade Customer
  console.log('\n--- TEST 4: Admin Customer Verification Flow ---');
  // Admin login
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@malikhardware.com',
      password: 'AdminMalikHardware#2026',
    }),
  });
  const adminCookie = extractCookie(adminLoginRes);
  const adminLoginData = await adminLoginRes.json();
  assert(adminLoginData.user.role === 'admin', 'Admin logged in with role admin');

  // Fetch customer list
  const customersRes = await fetch(`${BASE_URL}/api/admin/customers`, {
    headers: { Cookie: adminCookie },
  });
  const customersData = await customersRes.json();
  assert(customersRes.status === 200, 'Admin can list customers');
  const targetPendingUser = customersData.customers.find((c) => c.email === 'pending@contractor.com');
  assert(Boolean(targetPendingUser), 'Pending contractor found in customer approval queue');
  assert(targetPendingUser.isPriceVerified === false, 'Pending contractor initial status is unverified');

  // Admin APPROVES the contractor
  const approveRes = await fetch(`${BASE_URL}/api/admin/customers/${targetPendingUser._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ isPriceVerified: true }),
  });
  const approveData = await approveRes.json();
  assert(approveRes.status === 200 && approveData.customer.isPriceVerified === true, 'Admin successfully approved contractor rates');

  // Verify that LIVE DB LOOKUP enables the pending user immediately WITHOUT re-login!
  const newlyApprovedProdsRes = await fetch(`${BASE_URL}/api/products`, {
    headers: { Cookie: pendingCookie },
  });
  const newlyApprovedData = await newlyApprovedProdsRes.json();
  assert(newlyApprovedData.isPriceVerified === true, 'LIVE DB CHECK: Contractor session immediately recognized as verified without re-login');
  const pricesNowVisible = newlyApprovedData.products.every((p) => typeof p.price === 'number');
  assert(pricesNowVisible, 'LIVE DB CHECK: Wholesale rates are now unlocked in real-time');

  // Admin REVOKES verification to test safety toggle
  const revokeRes = await fetch(`${BASE_URL}/api/admin/customers/${targetPendingUser._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ isPriceVerified: false }),
  });
  const revokeData = await revokeRes.json();
  assert(revokeData.customer.isPriceVerified === false, 'Admin revoked verification for safety toggle test');

  // Verify immediately stripped again
  const reCheckRes = await fetch(`${BASE_URL}/api/products`, {
    headers: { Cookie: pendingCookie },
  });
  const reCheckData = await reCheckRes.json();
  assert(!reCheckData.products.some((p) => 'price' in p), 'Rates immediately locked again upon revocation');

  // Re-approve pending user for future tests
  await fetch(`${BASE_URL}/api/admin/customers/${targetPendingUser._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ isPriceVerified: true }),
  });

  // TEST 5: Verified Contractor Login & Session Cookie
  console.log('\n--- TEST 5: Verified Contractor Operations ---');
  const custLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'customer@sharmabuilders.com',
      password: 'CustomerPass#2026',
    }),
  });
  const custLoginData = await custLoginRes.json();
  const customerCookie = extractCookie(custLoginRes);

  assert(custLoginRes.status === 200, 'Customer login succeeded with 200 OK');
  assert(custLoginData.user.isPriceVerified === true, 'User is verified for wholesale pricing');

  // TEST 6: Price Unlocking for Verified User
  console.log('\n--- TEST 6: Verified Price Unlocking ---');
  const authProdsRes = await fetch(`${BASE_URL}/api/products`, {
    headers: { Cookie: customerCookie },
  });
  const authProdsData = await authProdsRes.json();
  assert(authProdsData.isAuthenticated === true, 'Session recognized as authenticated');
  assert(authProdsData.isPriceVerified === true, 'Session recognized as verified');

  const allHavePrice = authProdsData.products.every((p) => typeof p.price === 'number');
  assert(allHavePrice, 'Wholesale price is returned for all products to verified contractor');

  const authSingleRes = await fetch(`${BASE_URL}/api/products/bosch-rotary-hammer-drill-gbh-2-26-dre`, {
    headers: { Cookie: customerCookie },
  });
  const authSingleData = await authSingleRes.json();
  assert(typeof authSingleData.product.price === 'number', `Single product detail returns price: ₹${authSingleData.product.price}`);

  // TEST 7: Persistent Cart Operations
  console.log('\n--- TEST 7: Cart Management ---');
  const cartRes = await fetch(`${BASE_URL}/api/cart`, {
    headers: { Cookie: customerCookie },
  });
  const cartData = await cartRes.json();
  assert(cartRes.status === 200, 'Cart endpoint returns 200 OK');

  // Add item to cart
  const targetProduct = authProdsData.products[0];
  const addRes = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({ productId: targetProduct._id, quantity: 2 }),
  });
  const addData = await addRes.json();
  assert(addData.success === true, 'Added item to cart via API');

  // TEST 8: Checkout & Order Creation
  console.log('\n--- TEST 8: Checkout Flow ---');
  const checkoutRes = await fetch(`${BASE_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Rajesh Sharma Construction Site',
        phone: '+91 98111 22334',
        street: 'Gate 4, Metro Casting Yard, NH-8',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122001',
        country: 'India',
      },
      notes: 'Verify test checkout execution with verified user',
    }),
  });
  const checkoutData = await checkoutRes.json();
  assert(checkoutRes.status === 200, 'Order successfully placed via checkout');
  assert(checkoutData.order && checkoutData.order.status === 'pending', 'Order created with pending status per COD requirement');

  // Verify cart was cleared
  const postCheckoutCart = await fetch(`${BASE_URL}/api/cart`, {
    headers: { Cookie: customerCookie },
  });
  const postCartData = await postCheckoutCart.json();
  assert(postCartData.cart.items.length === 0, 'Cart was cleared after checkout placement');

  // TEST 9: Admin Stats & Order Management
  console.log('\n--- TEST 9: Admin Stats & Order Management ---');
  const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: adminCookie },
  });
  const statsData = await statsRes.json();
  assert(statsRes.status === 200, 'Admin stats loaded successfully');
  assert('pendingVerifications' in statsData.stats, 'Admin stats report pendingVerifications count');

  // Admin order status update
  const updateOrderRes = await fetch(`${BASE_URL}/api/admin/orders/${checkoutData.orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ status: 'confirmed' }),
  });
  const updateOrderData = await updateOrderRes.json();
  assert(updateOrderData.order.status === 'confirmed', 'Admin updated order status from pending to confirmed');

  // TEST 10: Public Site Settings (Marquee Message)
  console.log('\n--- TEST 10: Public Site Settings (Marquee Message) ---');
  const settingsRes = await fetch(`${BASE_URL}/api/settings`);
  const settingsData = await settingsRes.json();
  assert(settingsRes.status === 200, 'Public settings returns 200 OK');
  assert('marqueeMessage' in settingsData.settings, 'Settings payload contains marqueeMessage field');
  assert(settingsData.settings.marqueeMessage.length > 0, 'Seeded marquee message is active');

  // TEST 11: Admin Settings Access Control & Mutation
  console.log('\n--- TEST 11: Admin Settings Access Control & Mutation ---');
  // Unauthenticated attempt should fail with 403
  const guestSettingsPut = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ marqueeMessage: 'Hacked marquee' }),
  });
  assert(guestSettingsPut.status === 403, 'Guest cannot edit site settings (403 Forbidden)');

  // Customer attempt should fail with 403
  const customerSettingsPut = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({ marqueeMessage: 'Customer attempt' }),
  });
  assert(customerSettingsPut.status === 403, 'Verified customer cannot edit site settings (403 Forbidden)');

  // Admin update should succeed
  const testNewMarquee = '⚡ Special Site Notice: Test verification run active. All systems operational.';
  const adminSettingsPut = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ marqueeMessage: testNewMarquee }),
  });
  const adminSettingsData = await adminSettingsPut.json();
  assert(adminSettingsPut.status === 200, 'Admin can update marquee message (200 OK)');
  assert(adminSettingsData.settings.marqueeMessage === testNewMarquee, 'Marquee message correctly saved');

  // Verify public endpoint reflects the update
  const verifySettingsRes = await fetch(`${BASE_URL}/api/settings`);
  const verifySettingsData = await verifySettingsRes.json();
  assert(verifySettingsData.settings.marqueeMessage === testNewMarquee, 'Public GET /api/settings immediately reflects admin update');

  // TEST 12: Public Blog API & Single Post View
  console.log('\n--- TEST 12: Public Blog API & Single Post View ---');
  const blogRes = await fetch(`${BASE_URL}/api/blog`);
  const blogData = await blogRes.json();
  assert(blogRes.status === 200, 'Public blog index returns 200 OK');
  assert(Array.isArray(blogData.posts) && blogData.posts.length >= 4, 'All seeded published blog articles returned');

  // Check single post
  const singleSlug = blogData.posts[0].slug;
  const singleBlogRes = await fetch(`${BASE_URL}/api/blog/${singleSlug}`);
  const singleBlogData = await singleBlogRes.json();
  assert(singleBlogRes.status === 200, `Public single post /api/blog/${singleSlug} returns 200 OK`);
  assert(singleBlogData.post.slug === singleSlug, 'Returned post matches requested slug');
  assert(singleBlogData.post.content && singleBlogData.post.content.length > 50, 'Post contains full article content');

  // Non-existent slug returns 404
  const nonExistentBlogRes = await fetch(`${BASE_URL}/api/blog/non-existent-article-slug`);
  assert(nonExistentBlogRes.status === 404, 'Non-existent blog slug returns 404 Not Found');

  // TEST 13: Admin Blog Management (CRUD)
  console.log('\n--- TEST 13: Admin Blog Management (CRUD) ---');
  // Admin list posts
  const adminBlogRes = await fetch(`${BASE_URL}/api/admin/blog`, {
    headers: { Cookie: adminCookie },
  });
  const adminBlogData = await adminBlogRes.json();
  assert(adminBlogRes.status === 200, 'Admin can list all blog posts');

  // Admin create draft post
  const newArticleRes = await fetch(`${BASE_URL}/api/admin/blog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      title: 'Draft Article for Test Suite',
      slug: 'draft-article-test-suite',
      excerpt: 'This is a test draft article that should not be visible to guests.',
      content: 'Detailed internal engineering notes on pipeline stress calculations.',
      authorName: 'Test Engineer',
      isPublished: false,
    }),
  });
  const newArticleData = await newArticleRes.json();
  assert(newArticleRes.status === 201, 'Admin can author a new blog post (201 Created)');

  // Verify draft is NOT visible to public
  const publicDraftCheck = await fetch(`${BASE_URL}/api/blog/draft-article-test-suite`);
  assert(publicDraftCheck.status === 404, 'Draft article is hidden from public /api/blog/[slug] (404 Not Found)');

  // Clean up test article
  const deleteArticleRes = await fetch(`${BASE_URL}/api/admin/blog/${newArticleData.post._id}`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie },
  });
  assert(deleteArticleRes.status === 200, 'Admin can delete blog post (200 OK)');

  // TEST 14: Contact Form Submission (B2B Trade RFQ)
  console.log('\n--- TEST 14: Contact Form Submission ---');
  const contactRes = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Delhi Metro Contractor Corp',
      email: 'procurement@delhimetrocontractor.com',
      phone: '+91 99887 76655',
      message: 'Requesting formal quotation for 5,000 pcs M16 Grade 10.9 structural bolts and 200 cans Fischer pure epoxy.',
    }),
  });
  const contactData = await contactRes.json();
  assert(contactRes.status === 200, 'Trade contact inquiry submitted successfully (200 OK)');
  assert(contactData.success === true, 'Contact endpoint returns success: true');

  // Summary
  console.log('\n====================================================');
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
