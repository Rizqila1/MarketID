import modelAddress from "../models/m_address.js";
import isValidator from "../utils/validator.js";
import Messages from "../utils/messages.js";

const createAddress = async (req, res) => {
  const body = req.body;

  const rules = {
    name: "required|regex:/^[a-zA-Z ]*$/|min:4|max:20", // Regex alphabet and spaces only
    address: "required|regex:/^[a-zA-Z ]*$/|min:12|max:255", 
    province : {
      _id: "required",
      name: "required"
    },
    regency: {
      _id: "required",
      name: "required"
    },
    district: {
      _id: "required",
      name: "required"
    },
    village: {
      _id: "required",
      name: "required"
    },
    passcode: "required|numeric"
  };

  try {

    await isValidator(body, rules, {regex: "Special Characters or Number are not allowed"}, async(err, status) => {
      if(!status) return Messages(res, 412, { ...err, status });

      const user_id = res.checkout_user._id;
      const name = body.name.toLowerCase().trim();
      const address = req.body.address.trim();

      const filter = {
        $and: [{ user_id }, { name }]
      };

      const findByName = await modelAddress.findOne(filter)
      if(findByName) return Messages(res, 400, `Name (${name}) has been registered`);

      const payload = { ...body, name, address, user_id };

      await new modelAddress(payload).save();

      Messages(res, 201, "Create Address Success");
    })

  } catch (error) {
    Messages(res, 500, error?.messages || "Internal server error");
  }
};


const allAddress = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const user_id = res.checkout_user._id;

    const filter = {
      $and: [{ user_id }, { name : { $regex: q, $options: 'i' } }]
    };

    const total = await modelAddress.count(filter);
    const data = await modelAddress.find(filter)
    .sort({ _id: sort_key })
    .skip(pages)
    .limit(per_page);

    Messages(res, 200, "All Data", data, {
      page,
      per_page,
      total
    });

    
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  };
};

const detailAddress = async (req, res) => {
  const id = req.params.id;
  const user_id = res.checkout_user._id;

  try {
    const filter = {
      $and: [{ user_id }, { _id: id } ]
    };

    const findAddressByID = await modelAddress.findOne(filter)
    if(!findAddressByID) return Messages(res, 404, "Address not found");

    Messages(res, 200, "Detail Address", findAddressByID)

  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  }
};

const updateAddress = async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const user_id = res.checkout_user._id;

  const rules = {
    name: "required|regex:/^[a-zA-Z ]*$/|min:4|max:20", // Regex alphabet and spaces only
    address: "required|regex:/^[a-zA-Z ]*$/|min:12|max:255", 
    province : {
      _id: "required",
      name: "required"
    },
    regency: {
      _id: "required",
      name: "required"
    },
    district: {
      _id: "required",
      name: "required"
    },
    village: {
      _id: "required",
      name: "required"
    },
    passcode: "required|numeric"
  };

  try {

    const filter = {
      $and: [{ user_id }, { _id: id } ]
    };

    const findAddressByID = await modelAddress.findOne(filter)
    if(!findAddressByID) return Messages(res, 404, "Address not found");

    await isValidator(body, rules, {regex: "Special Characters or Number are not allowed"}, async(err, status) => {
      if(!status) return Messages(res, 412, { ...err, status });

      const name = req.body.name.toLowerCase().trim();
      const address = req.body.address.trim();

      const payload = { ...body, name, address };

      const data = await modelAddress.findOneAndUpdate(filter, payload, { new: true });

      Messages(res, 200, "Update Adress Success", data)
    });

  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  }
};

const deleteAddress = async (req, res) => {
  const id = req.params.id;
  const user_id = res.checkout_user._id;

  try {
    const filter = {
      $and: [{ user_id }, { _id: id } ]
    };

    const findAddressByID = await modelAddress.findOne(filter)
    if(!findAddressByID) return Messages(res, 404, "Address not found");

    await modelAddress.deleteOne(filter);

    Messages(res, 200, `Delete Address Success`);
    
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal server error");
  };
};

export {
  createAddress,
  allAddress,
  detailAddress,
  updateAddress,
  deleteAddress
}