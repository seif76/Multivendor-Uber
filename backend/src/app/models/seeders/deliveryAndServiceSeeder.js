const initializeDatabase = require('../../../config/mysql/dbconnection');
const DeliveryZoneModel = require('../deliveryZone');
const ServiceFeeModel = require('../serviceFee');

module.exports = async function seedDeliveryZonesAndServiceFee() {
  try {
    const sequelize = await initializeDatabase();
    const { DataTypes } = require('sequelize');

    const DeliveryZone = DeliveryZoneModel(sequelize, DataTypes);
    const ServiceFee = ServiceFeeModel(sequelize, DataTypes);

    // 1. Sync tables
    await DeliveryZone.sync({ alter: true });
    await ServiceFee.sync({ alter: true });
    console.log('✅ DeliveryZone and ServiceFee tables synced successfully.');

    // 2. Seed delivery zones
    const deliveryZones = [
      { city_name: 'منطقة المردوم', zone_name: 'المردوم',   base_delivery_fee: 15.00, is_active: true },
      { city_name: 'منطقة اشميخ',  zone_name: 'اشميخ',     base_delivery_fee: 15.00, is_active: true },
      { city_name: 'تنيناي',        zone_name: 'تنيناي',     base_delivery_fee: 15.00, is_active: true },
      { city_name: 'وسط السوق',     zone_name: 'وسط السوق', base_delivery_fee: 5.00,  is_active: true },
      { city_name: 'منطقة الظهرة', zone_name: 'الظهرة',    base_delivery_fee: 10.00, is_active: true },
    ];

    for (const zone of deliveryZones) {
      await DeliveryZone.upsert(zone, { where: { city_name: zone.city_name } });
    }
    console.log('✅ Delivery zones seeded or updated successfully.');

    // 3. Seed service fee only if table is empty
    const existing = await ServiceFee.findOne();
    if (!existing) {
      await ServiceFee.create({ fee_type: 'percentage', value: 2.00, is_active: true });
      console.log('✅ Service fee seeded successfully.');
    } else {
      console.log('⚠️  Service fee already exists, skipping...');
    }

  } catch (error) {
    console.error('❌ Error seeding delivery zones and service fee:', error);
  }
};

// Run automatically if executed directly
if (require.main === module) {
  (async () => {
    await module.exports();
  })();
}