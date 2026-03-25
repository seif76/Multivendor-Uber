const { DeliveryZone } = require('../../../app/models');

const getAllZonesService = async () => {
  return await DeliveryZone.findAll({
    order: [['id', 'DESC']]
  });
};

const getZoneByIdService = async (id) => {
  const zone = await DeliveryZone.findByPk(id);
  if (!zone) throw new Error('Delivery zone not found');
  return zone;
};

const createZoneService = async (zoneData) => {
  // Check if city_name + zone_name combination already exists (optional, based on your business logic)
  return await DeliveryZone.create({
    city_name: zoneData.city_name,
    zone_name: zoneData.zone_name,
    description: zoneData.description,
    base_delivery_fee: zoneData.base_delivery_fee,
    is_active: zoneData.is_active !== undefined ? zoneData.is_active : true
  });
};

const updateZoneService = async (id, updateData) => {
  const zone = await DeliveryZone.findByPk(id);
  if (!zone) throw new Error('Delivery zone not found');

  return await zone.update({
    city_name: updateData.city_name || zone.city_name,
    zone_name: updateData.zone_name !== undefined ? updateData.zone_name : zone.zone_name,
    description: updateData.description !== undefined ? updateData.description : zone.description,
    base_delivery_fee: updateData.base_delivery_fee !== undefined ? updateData.base_delivery_fee : zone.base_delivery_fee,
    is_active: updateData.is_active !== undefined ? updateData.is_active : zone.is_active
  });
};

const toggleZoneStatusService = async (id, is_active) => {
  const zone = await DeliveryZone.findByPk(id);
  if (!zone) throw new Error('Delivery zone not found');

  return await zone.update({ is_active });
};

const deleteZoneService = async (id) => {
  const zone = await DeliveryZone.findByPk(id);
  if (!zone) throw new Error('Delivery zone not found');

  await zone.destroy();
  return { message: 'Delivery zone deleted successfully' };
};

module.exports = {
  getAllZonesService,
  getZoneByIdService,
  createZoneService,
  updateZoneService,
  toggleZoneStatusService,
  deleteZoneService
};