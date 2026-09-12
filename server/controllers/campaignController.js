const db = require("../config/db");

// =====================================================
// HELPERS
// =====================================================

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// =====================================================
// CREATE CAMPAIGN (Admin)
// POST /api/campaigns
// =====================================================

const createCampaign = async (req, res) => {
  try {
    const {
      name, slug, description, banner_image, discount_type, discount_value,
      max_discount, min_order_amount, buy_quantity, get_quantity,
      start_date, end_date, is_active, priority, category_ids, product_ids,
    } = req.body;

    if (!name || !discount_type || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: "Name, discount type, start date, and end date are required" });
    }

    const campaignSlug = slug || name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    const result = await query(
      `INSERT INTO campaigns (name, slug, description, banner_image, discount_type, discount_value, max_discount, min_order_amount, buy_quantity, get_quantity, start_date, end_date, is_active, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, campaignSlug, description || null, banner_image || null, discount_type, discount_value || 0, max_discount || null, min_order_amount || 0, buy_quantity || null, get_quantity || null, start_date, end_date, is_active !== false, priority || 0]
    );

    const campaignId = result.insertId;

    if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
      for (const catId of category_ids) {
        await query(`INSERT INTO campaign_categories (campaign_id, category_id) VALUES (?, ?)`, [campaignId, catId]);
      }
    }

    if (product_ids && Array.isArray(product_ids) && product_ids.length > 0) {
      for (const prodId of product_ids) {
        await query(`INSERT INTO campaign_products (campaign_id, product_id) VALUES (?, ?)`, [campaignId, prodId]);
      }
    }

    return res.status(201).json({ success: true, message: "Campaign created successfully", campaign: { id: campaignId, name, slug: campaignSlug } });
  } catch (error) {
    console.error("Create Campaign Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create campaign" });
  }
};

// =====================================================
// GET ALL CAMPAIGNS (Admin)
// GET /api/campaigns
// =====================================================

const getAllCampaigns = async (req, res) => {
  try {
    const rows = await query(`SELECT * FROM campaigns ORDER BY priority DESC, created_at DESC`);

    for (let campaign of rows) {
      const categories = await query(`SELECT category_id FROM campaign_categories WHERE campaign_id = ?`, [campaign.id]);
      campaign.category_ids = categories.map((c) => c.category_id);

      const products = await query(`SELECT product_id FROM campaign_products WHERE campaign_id = ?`, [campaign.id]);
      campaign.product_ids = products.map((p) => p.product_id);
    }

    return res.json({ success: true, campaigns: rows });
  } catch (error) {
    console.error("Get Campaigns Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch campaigns" });
  }
};

// =====================================================
// GET SINGLE CAMPAIGN (Admin)
// GET /api/campaigns/:id
// =====================================================

const getCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query(`SELECT * FROM campaigns WHERE id = ?`, [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    const campaign = rows[0];

    const categories = await query(`SELECT category_id FROM campaign_categories WHERE campaign_id = ?`, [id]);
    campaign.category_ids = categories.map((c) => c.category_id);

    const products = await query(`SELECT product_id FROM campaign_products WHERE campaign_id = ?`, [id]);
    campaign.product_ids = products.map((p) => p.product_id);

    return res.json({ success: true, campaign });
  } catch (error) {
    console.error("Get Campaign Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch campaign" });
  }
};

// =====================================================
// UPDATE CAMPAIGN (Admin)
// PUT /api/campaigns/:id
// =====================================================

const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, banner_image, discount_type, discount_value,
      max_discount, min_order_amount, buy_quantity, get_quantity,
      start_date, end_date, is_active, priority, category_ids, product_ids,
    } = req.body;

    const rows = await query(`SELECT id FROM campaigns WHERE id = ?`, [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    await query(
      `UPDATE campaigns SET name = ?, description = ?, banner_image = ?, discount_type = ?, discount_value = ?, max_discount = ?, min_order_amount = ?, buy_quantity = ?, get_quantity = ?, start_date = ?, end_date = ?, is_active = ?, priority = ? WHERE id = ?`,
      [name, description || null, banner_image || null, discount_type, discount_value || 0, max_discount || null, min_order_amount || 0, buy_quantity || null, get_quantity || null, start_date, end_date, is_active !== false, priority || 0, id]
    );

    if (category_ids !== undefined) {
      await query(`DELETE FROM campaign_categories WHERE campaign_id = ?`, [id]);
      if (Array.isArray(category_ids) && category_ids.length > 0) {
        for (const catId of category_ids) {
          await query(`INSERT INTO campaign_categories (campaign_id, category_id) VALUES (?, ?)`, [id, catId]);
        }
      }
    }

    if (product_ids !== undefined) {
      await query(`DELETE FROM campaign_products WHERE campaign_id = ?`, [id]);
      if (Array.isArray(product_ids) && product_ids.length > 0) {
        for (const prodId of product_ids) {
          await query(`INSERT INTO campaign_products (campaign_id, product_id) VALUES (?, ?)`, [id, prodId]);
        }
      }
    }

    return res.json({ success: true, message: "Campaign updated successfully" });
  } catch (error) {
    console.error("Update Campaign Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update campaign" });
  }
};

// =====================================================
// DELETE CAMPAIGN (Admin)
// DELETE /api/campaigns/:id
// =====================================================

const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM campaigns WHERE id = ?`, [id]);

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    return res.json({ success: true, message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Delete Campaign Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete campaign" });
  }
};

// =====================================================
// GET ACTIVE CAMPAIGNS (Public)
// GET /api/campaigns/active
// =====================================================

const getActiveCampaigns = async (req, res) => {
  try {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const rows = await query(
      `SELECT * FROM campaigns WHERE is_active = 1 AND start_date <= ? AND end_date >= ? ORDER BY priority DESC`,
      [now, now]
    );

    return res.json({ success: true, campaigns: rows });
  } catch (error) {
    console.error("Get Active Campaigns Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch active campaigns" });
  }
};

// =====================================================
// TOGGLE CAMPAIGN (Admin)
// PATCH /api/campaigns/:id/toggle
// =====================================================

const toggleCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query(`SELECT is_active FROM campaigns WHERE id = ?`, [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    const newStatus = !Boolean(rows[0].is_active);
    await query(`UPDATE campaigns SET is_active = ? WHERE id = ?`, [newStatus, id]);

    return res.json({ success: true, message: newStatus ? "Campaign activated" : "Campaign deactivated", is_active: newStatus });
  } catch (error) {
    console.error("Toggle Campaign Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update campaign status" });
  }
};

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getActiveCampaigns,
  toggleCampaign,
};

