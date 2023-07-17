import modelProducts from "../models/m_products.js";
import modelCategories from "../models/m_categories.js";
import Cloudinary from "../config/cloudinary.js";
import Messages from "../utils/messages.js";
import isValidator from "../utils/validator.js";

const createProduct = async (req, res) => {
  const body = req.body;
  const file = req.file;

  const rules = {
    name: "required|regex:/^[a-zA-Z0-9 ]*$/|max:20", // Regex alphanumeric and spaces only
    price: "required|numeric",
    category_id: "required|alpha_num",
  };

  try {
    if (!file) return Messages(res, 412, "Image required");

    await isValidator(
      { ...body },
      rules,
      { regex: "Special characters are not allowed" },
      async (err, status) => {
        if (!status) return Messages(res, 412, { ...err, status });

        try {
          const findCategory = await modelCategories.findOne({
            _id: body.category_id,
          });
          if (!findCategory) return Messages(res, 404, "Category not found");

          // upload image to cloudinary
          const result = await Cloudinary.uploader.upload(file.path);

          // assign data
          const payload = {
            ...body,

            name: body.name.trim(),
            price: parseInt(body.price),
            image: {
              url: result.secure_url,
              cloudinary_id: result.public_id,
            },
            category: {
              _id: findCategory._id,
              name: findCategory.name,
            },
          };

          await new modelProducts(payload).save();

          Messages(res, 201, "Create Product Success", payload);
        } catch (error) {
          Messages(
            res,
            500,
            error?.messages ||
              "Something wrong when find category, please check id category"
          );
        }
      }
    );
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal server error");
  }
};

const allProducts = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const filter = { name: { $regex: q, $options: "i" } };

    const total = await modelProducts.count(filter);
    const data = await modelProducts
      .find(filter)
      .sort({ _id: sort_key })
      .skip(pages)
      .limit(per_page);

    Messages(res, 200, "All Data", data, {
      page,
      per_page,
      total,
    });
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal server error");
  }
};

const detailProduct = async (req, res) => {
  const id = req.params.id;

  try {
    const findProduct = await modelProducts.findById(id);
    if (!findProduct) return Messages(res, 404, `Product ID ${id} not found`);

    Messages(res, 200, "Detail Data", findProduct);
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal server error");
  }
};

const updateProduct = async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const file = req.file;

  const rules = {
    name: "required|regex:/^[a-zA-Z0-9 ]*$/|max:20", // Regex alphanumeric and spaces only
    price: "required|numeric",
    category_id: "required|alpha_num",
  };

  try {
    const findProduct = await modelProducts.findById(id);
    if (!findProduct) return Messages(res, 404, `Product ID ${id} not found`);

    await isValidator(
      { ...body },
      rules,
      { regex: "Special characters are not allowed" },
      async (err, status) => {
        if (!status) return Messages(res, 412, { ...err, status });

        let payload = {};

        try {
          const findCategory = await modelCategories.findOne({
            _id: body.category_id,
          });
          if (!findCategory)
            return Messages(
              res,
              404,
              `Category ID ${body.category_id} not found`
            );

          if (file) {
            const product_image = findProduct._doc.image.url;
            const product_cloudinary_id = findProduct._doc.image.cloudinary_id;

            // delete exist image
            if (product_image)
              await Cloudinary.uploader.destroy(product_cloudinary_id);

            // upload new image
            const result = await Cloudinary.uploader.upload(file.path);

            // assign data secure_url and public_id to key image
            payload.image = {
              url: result.secure_url,
              cloudinary_id: result.public_id,
            };
          }

          payload = {
            ...body,
            ...payload,
            name: body.name.trim(),
            category: {
              _id: findCategory._id,
              name: findCategory.name,
            },
          };

          const newData = await modelProducts.findByIdAndUpdate(
            id,
            { ...payload },
            { new: true }
          );

          Messages(res, 200, "Update Product Success", newData);
        } catch (error) {
          Messages(
            res,
            500,
            error?.messages ||
              "Something wrong when find category, please check id category"
          );
        }
      }
    );
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal server error");
  }
};

const deleteProduct = async (req, res) => {
  const id = req.params.id;

  try {
    const findProduct = await modelProducts.findById(id);
    if (!findProduct) return Messages(res, 404, "Product Not Found");

    const cloudinary_id = findProduct._doc.image.cloudinary_id;

    if (cloudinary_id) await Cloudinary.uploader.destroy(cloudinary_id);

    await modelProducts.deleteOne({ _id: id });

    Messages(res, 200, `Delete Product (${findProduct.name}) Success`);
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  }
};

export {
  createProduct,
  allProducts,
  detailProduct,
  updateProduct,
  deleteProduct,
};
