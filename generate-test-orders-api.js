const http = require('http');

async function createOrder(email, index) {
    const orderData = {
        customer: {
            firstName: 'TestUser',
            lastName: `Generated${index}`,
            email: email,
            phone: '1234567890'
        },
        deliveryAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            pincode: '123456',
            country: 'Test Country'
        },
        items: [
            {
                productId: 60, // Try 60
                productName: 'Project Ready UNDERGROUND CABLE FAULT DETECTOR',
                quantity: 1,
                price: 100
            }
        ],
        pricing: {
            subtotal: 100,
            tax: 10,
            shipping: 50,
            total: 160
        },
        paymentMethod: 'cod'
    };

    const data = JSON.stringify(orderData);

    const options = {
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/guest-orders',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`✅ Order for ${email} created: HTTP ${res.statusCode}`);
                    resolve(body);
                } else {
                    console.error(`❌ Failed for ${email}: HTTP ${res.statusCode} - ${body}`);
                    resolve(null); // Resolve to continue loop
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ Request error for ${email}:`, e.message);
            resolve(null);
        });

        req.write(data);
        req.end();
    });
}

(async () => {
    console.log('--- Generating 5 Test Guest Orders via API ---');
    const emails = [
        'buyer1@example.com',
        'buyer2@example.com',
        'buyer3@example.com',
        'buyer4@example.com',
        'buyer5@example.com'
    ];

    for (let i = 0; i < emails.length; i++) {
        await createOrder(emails[i], i + 1);
        // Brief pause to ensure separate timestamps if needed
        await new Promise(r => setTimeout(r, 200));
    }
    console.log('Done.');
})();
