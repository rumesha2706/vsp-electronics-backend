const db = require('../db/index');

const brands = [
    { id: '1', name: 'ACEBOTT', slug: 'acebott', image: 'assets/images/brands/LOGO.png' },
    { id: '2', name: 'Amass', slug: 'amass', image: 'assets/images/brands/Amass-1.jpg' },
    { id: '3', name: 'Arduino', slug: 'arduino', image: 'assets/images/brands/Arduino.png' },
    { id: '4', name: 'BONKA', slug: 'bonka', image: 'assets/images/brands/BONKA.png' },
    { id: '5', name: 'EFT', slug: 'eft', image: 'assets/images/brands/EFT-1.jpg' },
    { id: '6', name: 'Elcon', slug: 'elcon', image: 'assets/images/brands/Elcon-1-e1713075585301.jpg' },
    { id: '7', name: 'EMAX', slug: 'emax', image: 'assets/images/brands/EMAX-LOGO.png' },
    { id: '8', name: 'Hobbywing', slug: 'hobbywing', image: 'assets/images/brands/Hobbywing.png' },
    { id: '9', name: 'JIYI', slug: 'jiyi', image: 'assets/images/brands/LOGO.png' },
    { id: '10', name: 'Mastech', slug: 'mastech', image: 'assets/images/brands/Mastech-1.png' },
    { id: '11', name: 'Raspberry Pi', slug: 'raspberry-pi', image: 'assets/images/brands/pi.jpg' },
    { id: '12', name: 'SKYDROID', slug: 'skydroid', image: 'assets/images/brands/SKydroid.jpg' },
    { id: '13', name: 'SKYRC', slug: 'skyrc', image: 'assets/images/brands/SKYRC.png' },
    { id: '14', name: 'TATTU', slug: 'tattu', image: 'assets/images/brands/TATTU.jpg' }
];

async function seedBrands() {
    console.log('Starting brand seed...');

    try {
        for (const brand of brands) {
            // Upsert based on name or slug
            const query = `
            INSERT INTO brands (name, slug, logo_url, is_featured)
            VALUES ($1, $2, $3, true)
            ON CONFLICT (slug) 
            DO UPDATE SET 
                logo_url = EXCLUDED.logo_url,
                is_featured = true;
        `;

            await db.query(query, [brand.name, brand.slug, brand.image]);
            console.log(`Updated brand: ${brand.name}`);
        }
        console.log('Brand seeding completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding brands:', err);
        process.exit(1);
    }
}

seedBrands();
