import { FaTrashAlt } from "react-icons/fa";

function CartItem({
  item,
  removeItem,
  increaseQty,
  decreaseQty,
}) {
  const IMAGE_URL =
    import.meta.env.VITE_SERVER_IMAGES_URL ||
    "http://localhost:4000/images";

  // =========================
  // GET IMAGE URL
  // =========================
  const getImageURL = (image) => {
    if (!image) {
      return "";
    }

    const imageString = String(image).trim();

    // Already full URL
    if (
      imageString.startsWith("http://") ||
      imageString.startsWith("https://")
    ) {
      return imageString;
    }

    // Remove starting slash
    const cleanImage = imageString.replace(/^\/+/, "");

    // Remove duplicate images/
    const finalImage = cleanImage.replace(/^images\//, "");

    return `${IMAGE_URL.replace(/\/+$/, "")}/${finalImage}`;
  };

  const quantity = Number(item.quantity || 1);

  const stock = Number(item.stock ?? 0);

  const productImage =
    item.image ||
    item.productImage ||
    item.product_image ||
    (Array.isArray(item.images)
      ? item.images[0]
      : item.images);

  const imageURL = getImageURL(productImage);

  return (
    <div
      className="
        grid
        grid-cols-12
        gap-4
        items-center
        border-b
        p-4
        mt-8
        bg-white
      "
    >
      {/* =========================
          IMAGE
      ========================= */}

      <div className="col-span-12 sm:col-span-2">
        {imageURL ? (
          <img
            src={imageURL}
            alt={item.name || item.title || "Product"}
            className="
              w-32
              h-36
              rounded-xl
              object-cover
              border
            "
            onError={(e) => {
              console.error(
                "IMAGE ERROR:",
                e.currentTarget.src
              );

              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div
            className="
              w-32
              h-36
              rounded-xl
              border
              flex
              items-center
              justify-center
              bg-gray-100
              text-gray-400
            "
          >
            No Image
          </div>
        )}
      </div>

      {/* =========================
          PRODUCT DETAILS
      ========================= */}

      <div
        className="
          col-span-12
          sm:col-span-5
          text-gray-700
        "
      >
        <h2 className="text-2xl font-bold">
          {item.name || item.title || "Product"}
        </h2>

        {item.description && (
          <p className="text-gray-500 mt-1">
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-4 pt-4">
          <span className="text-2xl font-bold text-gray-700">
            ₹{Number(item.price || 0).toFixed(0)}
          </span>

          {item.oldPrice && (
            <span className="line-through text-gray-400">
              ₹{Number(item.oldPrice).toFixed(0)}
            </span>
          )}
        </div>

        {item.offer && (
          <p className="text-green-600 font-semibold mt-2">
            {item.offer}
          </p>
        )}

        {stock <= 0 ? (
          <p className="mt-2 font-semibold text-red-600">
            Out of Stock
          </p>
        ) : quantity >= stock ? (
          <p className="mt-2 font-semibold text-orange-600">
            Only {stock} available
          </p>
        ) : (
          <p className="mt-2 text-green-600">
            In Stock
          </p>
        )}
      </div>

      {/* =========================
          SIZE
      ========================= */}

      <div
        className="
          col-span-6
          sm:col-span-1
          text-center
          border-l
          border-r
          py-4
        "
      >
        <p className="font-semibold pb-2">
          Size
        </p>

        <h3 className="text-2xl font-bold mt-3">
          {item.size || "-"}
        </h3>
      </div>

      {/* =========================
          QUANTITY
      ========================= */}

      <div
        className="
          col-span-6
          sm:col-span-2
          text-center
          border-r
          py-4
        "
      >
        <p className="font-semibold pb-4">
          Quantity
        </p>

        <div
          className="
            flex
            justify-center
            items-center
            gap-3
          "
        >
          <button
            type="button"
            onClick={() =>
              decreaseQty(item.cartItemId)
            }
            className="
              w-10
              h-10
              rounded-lg
              border
              hover:bg-gray-100
              cursor-pointer
              font-bold
              text-xl
            "
          >
            -
          </button>

          <span className="text-2xl font-bold">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              increaseQty(item.cartItemId)
            }
            disabled={
              stock <= 0 ||
              quantity >= stock
            }
            className="
              w-10
              h-10
              rounded-lg
              border
              hover:bg-gray-100
              cursor-pointer
              font-bold
              text-xl
              disabled:opacity-40
              disabled:cursor-not-allowed
            "
          >
            +
          </button>
        </div>
      </div>

      {/* =========================
          REMOVE
      ========================= */}

      <div
        className="
          col-span-12
          sm:col-span-2
          flex
          justify-center
        "
      >
        <button
          type="button"
          onClick={() =>
            removeItem(item.cartItemId)
          }
          className="
            text-red-500
            hover:text-red-700
            text-3xl
            cursor-pointer
          "
          title="Remove Product"
        >
          <FaTrashAlt />
        </button>
      </div>
    </div>
  );
}

export default CartItem;