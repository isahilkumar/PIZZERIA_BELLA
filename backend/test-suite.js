const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (dataString) {
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => (rawData += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: rawData });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (dataString) req.write(dataString);
    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Starting Full-Stack End-to-End Verification Test...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extra = '') => {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${extra}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${extra}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.data.status === 'ok', '1. Server Health Check');

    // 2. Public Catalog & Inventory
    const inventory = await request('GET', '/inventory');
    assert(
      inventory.status === 200 && inventory.data.grouped.base.length >= 5,
      '2. Inventory has at least 5 Bases',
      `(${inventory.data.grouped.base.length} bases)`
    );
    assert(
      inventory.data.grouped.sauce.length >= 5,
      '3. Inventory has at least 5 Sauces',
      `(${inventory.data.grouped.sauce.length} sauces)`
    );
    assert(
      inventory.data.grouped.cheese.length >= 1,
      '4. Inventory has Cheeses',
      `(${inventory.data.grouped.cheese.length} cheeses)`
    );
    assert(
      inventory.data.grouped.veggie.length >= 1,
      '5. Inventory has Vegetables',
      `(${inventory.data.grouped.veggie.length} veggies)`
    );

    const pizzas = await request('GET', '/pizzas');
    assert(pizzas.status === 200 && pizzas.data.pizzas.length > 0, '6. Predefined Pizza Varieties Available');

    // 3. User Registration with Email Verification Flow
    const testEmail = `patron_${Date.now()}@example.com`;
    const regRes = await request('POST', '/auth/register', {
      name: 'Test Patron',
      email: testEmail,
      password: 'PatronPassword123!',
    });
    assert(
      regRes.status === 201 && regRes.data.data.verificationToken,
      '7. User Registration & Verification Email Dispatched'
    );

    const verifyToken = regRes.data.data.verificationToken;

    // Try logging in BEFORE verification (should fail with 403 unverified)
    const unverifiedLogin = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'PatronPassword123!',
    });
    assert(
      unverifiedLogin.status === 403 && unverifiedLogin.data.requiresVerification,
      '8. Unverified User Login Blocked until Email Verified'
    );

    // Verify email using token
    const verifyRes = await request('GET', `/auth/verify-email/${verifyToken}`);
    assert(
      verifyRes.status === 200 && verifyRes.data.user.isVerified === true,
      '9. Email Verification Token Validated'
    );
    const userToken = verifyRes.data.token;

    // 4. User Login with JWT
    const loginRes = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'PatronPassword123!',
    });
    assert(loginRes.status === 200 && loginRes.data.token, '10. User Login with JWT Authorisation');

    // 5. Forgot Password & Reset Flow
    const forgotRes = await request('POST', '/auth/forgot-password', {
      email: testEmail,
    });
    assert(
      forgotRes.status === 200 && forgotRes.data.data.resetToken,
      '11. Forgot Password Flow (Dispatches Reset Link)'
    );

    const resetToken = forgotRes.data.data.resetToken;
    const resetRes = await request('POST', `/auth/reset-password/${resetToken}`, {
      password: 'NewPatronPassword456!',
    });
    assert(resetRes.status === 200, '12. Reset Password via Token Validated');

    // 6. Separate Admin Login
    const adminLoginRes = await request('POST', '/auth/admin/login', {
      email: 'admin@pizzadelivery.com',
      password: 'Admin@123456',
    });
    assert(
      adminLoginRes.status === 200 && adminLoginRes.data.user.role === 'admin',
      '13. Dedicated Admin Login (role: admin verified)'
    );
    const adminToken = adminLoginRes.data.token;

    // Test that customer credentials CANNOT login via admin portal
    const illegalAdminLogin = await request('POST', '/auth/admin/login', {
      email: testEmail,
      password: 'NewPatronPassword456!',
    });
    assert(illegalAdminLogin.status === 401, '14. Public User Blocked from Admin Gateway');

    // 7. Custom Pizza Ordering & Inventory Decrement
    const baseItem = inventory.data.grouped.base[0];
    const sauceItem = inventory.data.grouped.sauce[0];
    const cheeseItem = inventory.data.grouped.cheese[0];
    const veggieItem = inventory.data.grouped.veggie[0];

    const initialBaseStock = baseItem.stockQuantity;

    // Create order
    const orderCreateRes = await request(
      'POST',
      '/orders/create',
      {
        items: [
          {
            itemType: 'custom',
            name: 'Verification Masterpiece',
            base: { id: baseItem._id, name: baseItem.name, price: baseItem.price },
            sauce: { id: sauceItem._id, name: sauceItem.name, price: sauceItem.price },
            cheese: { id: cheeseItem._id, name: cheeseItem.name, price: cheeseItem.price },
            veggies: [{ id: veggieItem._id, name: veggieItem.name, price: veggieItem.price }],
            quantity: 2,
            unitPrice: baseItem.price + sauceItem.price + cheeseItem.price + veggieItem.price,
            itemTotal: (baseItem.price + sauceItem.price + cheeseItem.price + veggieItem.price) * 2,
          },
        ],
        customer: {
          name: 'Verification Tester',
          email: testEmail,
          phone: '9998887776',
          address: {
            street: '123 Artisan Lane',
            city: 'Rome',
            pincode: '110001',
          },
        },
      },
      userToken
    );

    assert(
      orderCreateRes.status === 201 && orderCreateRes.data.orderId,
      '15. Custom Order Created with Razorpay Order ID'
    );
    const createdOrderId = orderCreateRes.data.orderId;

    // Verify Payment (Test mode success)
    const paymentVerifyRes = await request(
      'POST',
      '/orders/verify-payment',
      {
        orderId: createdOrderId,
        testModeSuccess: true,
      },
      userToken
    );

    assert(
      paymentVerifyRes.status === 200 && paymentVerifyRes.data.order.payment.status === 'completed',
      '16. Razorpay Test Mode Payment Confirmed & Verified'
    );

    // Verify Stock Automatically Decremented
    const updatedInventory = await request('GET', '/inventory');
    const updatedBase = updatedInventory.data.grouped.base.find((b) => b._id === baseItem._id);
    assert(
      updatedBase.stockQuantity === initialBaseStock - 2,
      '17. Inventory Stock Automatically Decremented',
      `(${initialBaseStock} -> ${updatedBase.stockQuantity})`
    );

    // 8. Admin Manual Stock Update & Configurable Threshold
    const manualUpdateRes = await request(
      'PUT',
      `/inventory/${baseItem._id}`,
      {
        stockQuantity: 15,
        threshold: 20,
      },
      adminToken
    );
    assert(
      manualUpdateRes.status === 200 && manualUpdateRes.data.item.stockQuantity === 15,
      '18. Admin Manual Stock & Threshold Update Capability'
    );

    // 9. Automated Email Notification to Admin for Low Stock (Node-Cron Trigger)
    const stockAlertRes = await request('POST', '/inventory/check-alerts', {}, adminToken);
    assert(
      stockAlertRes.status === 200 && stockAlertRes.data.result.hasLowStock === true,
      '19. Automated Low Stock Alert Detection & Nodemailer Dispatch',
      `(${stockAlertRes.data.result.count} low stock items flagged)`
    );

    // 10. Admin Order Management Panel & Real-Time Status Change
    const adminOrders = await request('GET', '/orders/admin/all', null, adminToken);
    assert(
      adminOrders.status === 200 && adminOrders.data.orders.length > 0,
      '20. Admin Order Management Panel (View All Orders)'
    );

    // Update status to 'In Kitchen'
    const statusUpdate1 = await request(
      'PUT',
      `/orders/admin/${createdOrderId}/status`,
      { status: 'In Kitchen' },
      adminToken
    );
    assert(
      statusUpdate1.status === 200 && statusUpdate1.data.order.status === 'In Kitchen',
      '21. Status Transition: Order Received -> In Kitchen'
    );

    // Update status to 'Sent to Delivery'
    const statusUpdate2 = await request(
      'PUT',
      `/orders/admin/${createdOrderId}/status`,
      { status: 'Sent to Delivery' },
      adminToken
    );
    assert(
      statusUpdate2.status === 200 && statusUpdate2.data.order.status === 'Sent to Delivery',
      '22. Status Transition: In Kitchen -> Sent to Delivery'
    );

    // Update status to 'Delivered'
    const statusUpdate3 = await request(
      'PUT',
      `/orders/admin/${createdOrderId}/status`,
      { status: 'Delivered' },
      adminToken
    );
    assert(
      statusUpdate3.status === 200 && statusUpdate3.data.order.status === 'Delivered',
      '23. Status Transition: Sent to Delivery -> Delivered'
    );

    console.log(`\n========================================`);
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
};

runTests();

