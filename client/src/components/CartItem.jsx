import { FaTrashAlt } from "react-icons/fa";

function CartItem({
  item,
  removeItem,
  increaseQty,
  decreaseQty,
}) {
  const imageURL = import.meta.env.VITE_SERVER_IMAGES_URL;

  // =========================
  // IMAGE URL
  // =========================

  const getImageURL = (image) => {
    if (!image) {
      return "";
    }

    // Agar image already complete URL hai
    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    // Server image
    return `${imageURL}/${image}`;
  };

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

      {/* ========================= */}
      {/* IMAGE */}
      {/* ========================= */}

      <div className="col-span-12 sm:col-span-2">

        <img
          src={getImageURL(item.image)}
          alt={item.name || item.title || "Product"}
          className="
            w-32
            h-36
            rounded-xl
            object-cover
          "
        />

      </div>

      {/* ========================= */}
      {/* PRODUCT DETAILS */}
      {/* ========================= */}

      <div
        className="
          col-span-12
          sm:col-span-5
          text-gray-700
        "
      >

        {/* PRODUCT NAME */}

        <h2 className="text-2xl font-bold">
          {item.name || item.title}
        </h2>

        {/* DESCRIPTION */}

        <p className="text-gray-500 mt-1">
          {item.description}
        </p>

        {/* PRICE */}

        <div className="flex items-center gap-4 pt-4">

          <span className="text-2xl font-bold text-gray-700">
            ₹{item.price}
          </span>

          {item.oldPrice && (
            <span
              className="
                line-through
                text-gray-400
              "
            >
              ₹{item.oldPrice}
            </span>
          )}

        </div>

        {/* OFFER */}

        {item.offer && (
          <p className="text-green-600 font-semibold mt-2">
            {item.offer}
          </p>
        )}

      </div>

      {/* ========================= */}
      {/* SIZE */}
      {/* ========================= */}

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

      {/* ========================= */}
      {/* QUANTITY */}
      {/* ========================= */}

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

          {/* MINUS */}

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

          {/* QUANTITY */}

          <span className="text-2xl font-bold">
            {item.quantity}
          </span>

          {/* PLUS */}

          <button
            type="button"
            onClick={() =>
              increaseQty(item.cartItemId)
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
            +
          </button>

        </div>

      </div>

      {/* ========================= */}
      {/* REMOVE */}
      {/* ========================= */}

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