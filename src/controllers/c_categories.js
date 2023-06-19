import modelCategories from "../models/m_categories.js";
import Messages from "../utils/messages.js";
import isValidator from "../utils/validator.js";

const createCategory = async (req, res) => {
  const name = req.body.name;

  const rules = {
    name: "required|alpha|min:3|max:15"
  };

  try {
    await isValidator({ name }, rules, null, async(err, status) => {
      if(!status) return Messages(res, 412, { ...err, status });

      const inputName = name.toLowerCase().trim();
      const filter = { name: { $regex: inputName, $options: 'i' } };
      const isSameName = await modelCategories.findOne(filter);

      if(isSameName)
        return Messages(res, 400, `category (${inputName}) has been registered on our system`);
  
      await new modelCategories({ name: inputName }).save();

      Messages(res, 201, `Create Category (${inputName}) Success`);
    });

  } catch (error) {
    Messages(res, 500, error?.messages || "Internal server error");
  }
};

const allCategories = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const filter = { name: { $regex: q, $options: 'i' } };

    const total = await modelCategories.count(filter);
    const data = await modelCategories.find(filter)
    .sort({ _id: sort_key })
    .skip(pages)
    .limit(per_page);

    Messages(res, 200, "All Data", data, {
      page,
      per_page,
      total
    });

  } catch (error) {
    Messages(res, 500, error?.messages || "Internal server error");
  };
};

const detailCategory = async (req, res) => {
  const id = req.params.id;

  try {
    const findCategory = await modelCategories.findById(id);
    if (!findCategory) return Messages(res, 404, `ID ${id} not found`);

    Messages(res, 200, "Detail Data", findCategory);
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal server error");
  };
};

const updateCategory = async (req, res) => {
  const id = req.params.id;
  const name = req.body.name;

  const rules = {
    name: "required|alpha|min:3|max:15"
  };

  try {
    const findCategory = await modelCategories.findById(id);
    if (!findCategory) return Messages(res, 404, `ID ${id} not found`);

    await isValidator({ name }, rules, null, async(err, status) => {
      if(!status) return Messages(res, 412, { ...err, status });
      
      const inputName = name.toLowerCase().trim();
      const filter = { name: { $regex: inputName, $options: 'i' } };

      const isSameName = await modelCategories.findOne(filter);
      if(isSameName)
        return Messages(res, 400, `category (${inputName}) has been registered on our system`);

      const updateData = await modelCategories.findByIdAndUpdate(id, {name: inputName}, { new: true });

      Messages(res, 200, "Update category success", updateData);
    })

  } catch (error) {
    Messages(res, 500, error?.messages || "Internal server error");
  }
};

const deleteCategory = async (req, res) => {
  const id = req.params.id;

  try {
    const findCategory = await modelCategories.findById(id);
    if (!findCategory) return Messages(res, 404, `ID ${id} not found`);

    await modelCategories.deleteOne({ _id: id });

    Messages(res, 200, `Delete Category (${findCategory.name}) Success`);
    
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal server error");
  };
};

export {
  createCategory,
  allCategories,
  detailCategory,
  updateCategory,
  deleteCategory
}