 
const db = require("../config/db");

// =====================================================
// HELPER: GET USER ID
// =====================================================

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?.user_id ||
    req.user?.userId ||
    null
  );
};

// =====================================================
// HELPER: CHECK VERIFIED PURCHASE
// User must have purchased the product
// and order must be Delivered
// =====================================================

const checkVerifiedPurchase = async (userId, productId) => {
  const [orders] = await db.promise().execute(
    `
      SELECT
        o.id AS order_id,
        o.order_number,
        o.status,
        oi.product_id
      FROM orders o
      INNER JOIN order_items oi
        ON oi.order_id = o.id
      WHERE
        o.user_id = ?
        AND oi.product_id = ?
        AND LOWER(TRIM(o.status)) = 'delivered'
      LIMIT 1
    `,
    [userId, productId]
  );

  return orders.length > 0;
};

// =====================================================
// ADD REVIEW
// POST /api/reviews
// =====================================================

exports.addReview = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const {
      product_id,
      productId,
      rating,
      review,
    } = req.body;

    const productIdValue =
      product_id ??
      productId ??
      null;

    // =================================================
    // VALIDATE PRODUCT ID
    // =================================================

    if (
      !productIdValue ||
      !Number.isInteger(Number(productIdValue)) ||
      Number(productIdValue) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    const productIdNumber = Number(productIdValue);

    // =================================================
    // VALIDATE RATING
    // =================================================

    const ratingValue = Number(rating);

    if (
      !Number.isInteger(ratingValue) ||
      ratingValue < 1 ||
      ratingValue > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // =================================================
    // REVIEW TEXT
    // =================================================

    const reviewText =
      typeof review === "string"
        ? review.trim()
        : "";

    // =================================================
    // CHECK PRODUCT
    // =================================================

    const [products] = await db.promise().execute(
      `
        SELECT id
        FROM products
        WHERE id = ?
        LIMIT 1
      `,
      [productIdNumber]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // =================================================
    // CHECK VERIFIED PURCHASE
    // =================================================

    const isVerifiedBuyer =
      await checkVerifiedPurchase(
        userId,
        productIdNumber
      );

    if (!isVerifiedBuyer) {
      return res.status(403).json({
        success: false,
        verifiedBuyer: false,
        message:
          "You can review this product only after purchasing and receiving it.",
      });
    }

    // =================================================
    // CHECK EXISTING REVIEW
    // =================================================

    const [existingReviews] =
      await db.promise().execute(
        `
          SELECT id
          FROM product_reviews
          WHERE
            product_id = ?
            AND user_id = ?
          LIMIT 1
        `,
        [
          productIdNumber,
          userId,
        ]
      );

    if (existingReviews.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "You have already reviewed this product",
      });
    }

    // =================================================
    // INSERT REVIEW
    // =================================================

    const [result] =
      await db.promise().execute(
        `
          INSERT INTO product_reviews
          (
            product_id,
            user_id,
            rating,
            review,
            status
          )
          VALUES (?, ?, ?, ?, 'approved')
        `,
        [
          productIdNumber,
          userId,
          ratingValue,
          reviewText || null,
        ]
      );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      reviewId: result.insertId,
      verifiedBuyer: true,
    });

  } catch (error) {
    console.error(
      "ADD REVIEW ERROR:",
      error
    );

    // Duplicate review safety
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message:
          "You have already reviewed this product",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

// =====================================================
// GET PRODUCT REVIEWS
// GET /api/reviews/product/:productId
// =====================================================

exports.getProductReviews = async (
  req,
  res
) => {
  try {
    const productId =
      Number(req.params.productId);

    // =================================================
    // VALIDATE PRODUCT ID
    // =================================================

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // =================================================
    // GET REVIEWS
    // =================================================

    const [reviews] =
      await db.promise().execute(
        `
          SELECT
            r.id,
            r.product_id,
            r.user_id,
            r.rating,
            r.review,
            r.created_at,
            r.updated_at,
            u.name AS user_name,
            1 AS verified_buyer
          FROM product_reviews r
          INNER JOIN users u
            ON u.id = r.user_id
          WHERE
            r.product_id = ?
            AND r.status = 'approved'
          ORDER BY r.created_at DESC
        `,
        [productId]
      );

    // =================================================
    // GET RATING SUMMARY
    // =================================================

    const [summaryRows] =
      await db.promise().execute(
        `
          SELECT
            COUNT(*) AS totalReviews,

            COALESCE(
              ROUND(AVG(rating), 1),
              0
            ) AS averageRating,

            SUM(
              CASE
                WHEN rating = 5 THEN 1
                ELSE 0
              END
            ) AS fiveStars,

            SUM(
              CASE
                WHEN rating = 4 THEN 1
                ELSE 0
              END
            ) AS fourStars,

            SUM(
              CASE
                WHEN rating = 3 THEN 1
                ELSE 0
              END
            ) AS threeStars,

            SUM(
              CASE
                WHEN rating = 2 THEN 1
                ELSE 0
              END
            ) AS twoStars,

            SUM(
              CASE
                WHEN rating = 1 THEN 1
                ELSE 0
              END
            ) AS oneStars

          FROM product_reviews

          WHERE
            product_id = ?
            AND status = 'approved'
        `,
        [productId]
      );

    const summary =
      summaryRows[0] || {};

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      summary: {
        totalReviews:
          Number(
            summary.totalReviews || 0
          ),

        averageRating:
          Number(
            summary.averageRating || 0
          ),

        fiveStars:
          Number(
            summary.fiveStars || 0
          ),

        fourStars:
          Number(
            summary.fourStars || 0
          ),

        threeStars:
          Number(
            summary.threeStars || 0
          ),

        twoStars:
          Number(
            summary.twoStars || 0
          ),

        oneStars:
          Number(
            summary.oneStars || 0
          ),
      },

      reviews,
    });

  } catch (error) {
    console.error(
      "GET PRODUCT REVIEWS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load product reviews",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE OWN REVIEW
// PUT /api/reviews/:id
// =====================================================

exports.updateReview = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required",
      });
    }

    const reviewId =
      Number(req.params.id);

    const {
      rating,
      review,
    } = req.body;

    // =================================================
    // VALIDATE ID
    // =================================================

    if (
      !Number.isInteger(reviewId) ||
      reviewId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    // =================================================
    // VALIDATE RATING
    // =================================================

    const ratingValue =
      Number(rating);

    if (
      !Number.isInteger(ratingValue) ||
      ratingValue < 1 ||
      ratingValue > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5",
      });
    }

    const reviewText =
      typeof review === "string"
        ? review.trim()
        : "";

    // =================================================
    // VERIFY REVIEW BELONGS TO USER
    // =================================================

    const [reviewRows] =
      await db.promise().execute(
        `
          SELECT
            id,
            product_id
          FROM product_reviews
          WHERE
            id = ?
            AND user_id = ?
          LIMIT 1
        `,
        [
          reviewId,
          userId,
        ]
      );

    if (reviewRows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found or you are not allowed to update it",
      });
    }

    const productId =
      Number(reviewRows[0].product_id);

    // =================================================
    // CHECK VERIFIED PURCHASE AGAIN
    // =================================================

    const isVerifiedBuyer =
      await checkVerifiedPurchase(
        userId,
        productId
      );

    if (!isVerifiedBuyer) {
      return res.status(403).json({
        success: false,
        verifiedBuyer: false,
        message:
          "You can update this review only for a delivered product.",
      });
    }

    // =================================================
    // UPDATE OWN REVIEW ONLY
    // =================================================

    const [result] =
      await db.promise().execute(
        `
          UPDATE product_reviews
          SET
            rating = ?,
            review = ?,
            status = 'approved',
            updated_at = NOW()
          WHERE
            id = ?
            AND user_id = ?
        `,
        [
          ratingValue,
          reviewText || null,
          reviewId,
          userId,
        ]
      );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found or you are not allowed to update it",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Review updated successfully",
      verifiedBuyer: true,
    });

  } catch (error) {
    console.error(
      "UPDATE REVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update review",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE OWN REVIEW
// DELETE /api/reviews/:id
// =====================================================

exports.deleteReview = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required",
      });
    }

    const reviewId =
      Number(req.params.id);

    if (
      !Number.isInteger(reviewId) ||
      reviewId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    // =================================================
    // DELETE OWN REVIEW
    // =================================================

    const [result] =
      await db.promise().execute(
        `
          DELETE FROM product_reviews
          WHERE
            id = ?
            AND user_id = ?
        `,
        [
          reviewId,
          userId,
        ]
      );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found or you are not allowed to delete it",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Review deleted successfully",
    });

  } catch (error) {
    console.error(
      "DELETE REVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete review",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN — GET ALL REVIEWS
// GET /api/reviews/admin/all
// =====================================================

exports.getAllReviews = async (
  req,
  res
) => {
  try {
    const [reviews] =
      await db.promise().execute(
        `
          SELECT
            r.id,
            r.product_id,
            r.user_id,
            r.rating,
            r.review,
            r.status,
            r.created_at,
            r.updated_at,

            p.name AS product_name,
            p.image AS product_image,

            u.name AS customer_name,
            u.email AS customer_email,

            1 AS verified_buyer

          FROM product_reviews r

          INNER JOIN products p
            ON p.id = r.product_id

          INNER JOIN users u
            ON u.id = r.user_id

          ORDER BY r.created_at DESC
        `
      );

    return res.status(200).json({
      success: true,
      reviews,
    });

  } catch (error) {
    console.error(
      "ADMIN GET REVIEWS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load reviews",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN — UPDATE REVIEW STATUS
// PATCH /api/reviews/admin/:id/status
// =====================================================

exports.updateReviewStatus = async (
  req,
  res
) => {
  try {
    const reviewId =
      Number(req.params.id);

    const {
      status,
    } = req.body;

    const allowedStatuses = [
      "approved",
      "pending",
      "rejected",
    ];

    if (
      !Number.isInteger(reviewId) ||
      reviewId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid review status",
      });
    }

    const [result] =
      await db.promise().execute(
        `
          UPDATE product_reviews
          SET
            status = ?,
            updated_at = NOW()
          WHERE id = ?
        `,
        [
          status,
          reviewId,
        ]
      );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Review status updated successfully",
    });

  } catch (error) {
    console.error(
      "ADMIN UPDATE REVIEW STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update review status",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN — DELETE REVIEW
// DELETE /api/reviews/admin/:id
// =====================================================

exports.adminDeleteReview = async (
  req,
  res
) => {
  try {
    const reviewId =
      Number(req.params.id);

    if (
      !Number.isInteger(reviewId) ||
      reviewId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const [result] =
      await db.promise().execute(
        `
          DELETE FROM product_reviews
          WHERE id = ?
        `,
        [reviewId]
      );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Review deleted successfully",
    });

  } catch (error) {
    console.error(
      "ADMIN DELETE REVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete review",
      error: error.message,
    });
  }
};
 
