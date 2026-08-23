const {
  createAddress,
  getAddressesByUserId,
  getAddressById,
  updateAddress,
  deleteAddress,
} = require("../models/addressModel");

// ==============================
// CREATE ADDRESS
// POST /api/addresses
// ==============================

exports.createAddress = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const {
    full_name,
    phone,
    email,
    address_line,
    city,
    state,
    pincode,
    country,
    is_default,
  } = req.body;

  // ==============================
  // REQUIRED FIELDS VALIDATION
  // ==============================

  if (
    !full_name ||
    !phone ||
    !address_line ||
    !city ||
    !state ||
    !pincode
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Full name, phone, address, city, state and pincode are required.",
    });
  }

  // ==============================
  // ADDRESS DATA
  // ==============================

  const addressData = {
    user_id: userId,
    full_name: full_name.trim(),
    phone: phone.trim(),
    email: email?.trim() || null,
    address_line: address_line.trim(),
    city: city.trim(),
    state: state.trim(),
    pincode: String(pincode).trim(),
    country: country?.trim() || "India",
    is_default: Boolean(is_default),
  };

  // ==============================
  // SAVE ADDRESS
  // ==============================

  createAddress(addressData, (err, result) => {
    if (err) {
      console.error("CREATE ADDRESS ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Unable to save address.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Address saved successfully.",
      addressId: result.insertId,
    });
  });
};

// ==============================
// GET MY ADDRESSES
// GET /api/addresses
// ==============================

exports.getMyAddresses = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  getAddressesByUserId(userId, (err, results) => {
    if (err) {
      console.error("GET ADDRESSES ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch addresses.",
      });
    }

    return res.status(200).json({
      success: true,
      addresses: results || [],
    });
  });
};

// ==============================
// GET SINGLE ADDRESS
// GET /api/addresses/:id
// ==============================

exports.getSingleAddress = (req, res) => {
  const userId = req.user?.id;
  const addressId = req.params.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!addressId) {
    return res.status(400).json({
      success: false,
      message: "Address ID is required.",
    });
  }

  getAddressById(addressId, userId, (err, results) => {
    if (err) {
      console.error("GET ADDRESS ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch address.",
      });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    return res.status(200).json({
      success: true,
      address: results[0],
    });
  });
};

// ==============================
// UPDATE ADDRESS
// PUT /api/addresses/:id
// ==============================

exports.updateMyAddress = (req, res) => {
  const userId = req.user?.id;
  const addressId = req.params.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const {
    full_name,
    phone,
    email,
    address_line,
    city,
    state,
    pincode,
    country,
    is_default,
  } = req.body;

  // ==============================
  // VALIDATION
  // ==============================

  if (
    !full_name ||
    !phone ||
    !address_line ||
    !city ||
    !state ||
    !pincode
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Full name, phone, address, city, state and pincode are required.",
    });
  }

  // ==============================
  // UPDATE DATA
  // ==============================

  const addressData = {
    full_name: full_name.trim(),
    phone: phone.trim(),
    email: email?.trim() || null,
    address_line: address_line.trim(),
    city: city.trim(),
    state: state.trim(),
    pincode: String(pincode).trim(),
    country: country?.trim() || "India",
    is_default: Boolean(is_default),
  };

  updateAddress(
    addressId,
    userId,
    addressData,
    (err, result) => {
      if (err) {
        console.error("UPDATE ADDRESS ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to update address.",
        });
      }

      if (!result || result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Address not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Address updated successfully.",
      });
    }
  );
};

// ==============================
// DELETE ADDRESS
// DELETE /api/addresses/:id
// ==============================

exports.deleteMyAddress = (req, res) => {
  const userId = req.user?.id;
  const addressId = req.params.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!addressId) {
    return res.status(400).json({
      success: false,
      message: "Address ID is required.",
    });
  }

  deleteAddress(addressId, userId, (err, result) => {
    if (err) {
      console.error("DELETE ADDRESS ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Unable to delete address.",
      });
    }

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
    });
  });
};