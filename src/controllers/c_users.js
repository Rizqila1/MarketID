import modelUser from "../models/m_users.js";
import modelRoles from "../models/m_roles.js";
import Messages from '../utils/messages.js';
import isValidator from '../utils/validator.js';

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config/secret.js";
import Cloudinary from "../config/cloudinary.js";

const allUsers = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const filter = { full_name: { $regex: q, $options: 'i' } };

    const total = await modelUser.count(filter);
    const data = await modelUser.find(filter)
    .sort({ _id: sort_key })
    .skip(pages)
    .limit(per_page);

    // delete/hide property password
    const newData = data.map((item) => {
      delete item._doc.password;
      return {
        ...item._doc,
      };
    });

    Messages(res, 200, "All Data", newData, {
      page,
      per_page,
      total
    });

    
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  };
};

const registerUser = async (req, res) => {
  const body = req.body;

  const rules = {
    full_name: "required|regex:/^[a-zA-Z ]*$/|min:3|max:15", // Regex alphabet and spaces only
    email: "required|email",
    password: "required|min:8|max:14",
  };

  await isValidator(body, rules, {regex: "This field must be alphabet only"}, async(err, status) => {
    if(!status) return Messages(res, 412, { ...err, status });

    const findByEmail = await modelUser.findOne({ email: body.email });
    if(findByEmail) return Messages(res, 400, "Email has been registered");

    const findRole = await modelRoles.findOne({ name: "customer" });
    if(!findRole) Messages(res, 404, "Role not found");

    // hash password
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(body.password, salt);

    await new modelUser({
      ...body,

      password,

      image: {
        url: null,
        cloudinary_id: null
      },
      role: {
        _id: findRole.id,
        name: findRole.name
      },
      status: true,
      token: null,

    }).save();
    
    Messages (res, 201, "Register Succeed");
  });
};

const loginUser = async (req, res) => {
  const body = req.body;

  const rules = {
    email: "required|email",
    password: "required|min:8|max:14"
  };

  try {
    await isValidator(body, rules, null, async(err, status) => {
      if(!status) return Messages(res, 412, { ...err, status });
    
    const findByEmail = await modelUser.findOne({ email: body.email });
    if(!findByEmail) return Messages(res, 200, "Email not registered");

    // compare password bcrypt
    const isHashPassword = findByEmail.password;
    const comparePassword = bcrypt.compareSync(body.password, isHashPassword);

    if(!comparePassword) return Messages(res, 400, "Wrong Password, please check again");

    // check status account user
    const isStatus = findByEmail.status;
    if(!isStatus) return Messages(res, 400, "Your Account is Being Deactivated");
    
    //variable id
    const id = findByEmail.id;

    // encode jsonwebtoken
    const payload = {
      _id: findByEmail.id,
      role: {
        _id: findByEmail.role._id,
        name: findByEmail.role.name
      },
      full_name: findByEmail.full_name,
      email: findByEmail.email
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });

    // update after token expired
    await modelUser.findByIdAndUpdate(id, { token }, { new: true });

    // finally
    Messages(res, 200, "Login Success", {_id: id, token, role: { ...findByEmail.role } });
  });

  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  }
};

const logoutUser = async (req, res) => {
  const id = req.params.id;

  try {
    const findUser = await modelUser.findById(id);
    if(!findUser) return Messages(res, 404, "User Not Found");

    const payload = { token: null };
    await modelUser.findByIdAndUpdate(id, payload, { new: true });

    Messages(res, 200, "Logout Success");

  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  }
};

const detailUser = async (req, res) => {
  const id = req.params.id;

  try {
    const findUser = await modelUser.findById(id);
    if(!findUser) return Messages(res, 404, "User Not Found");

    delete findUser._doc.password;

    Messages(res, 200, "Detail Data", findUser);
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  }
};

const updateUser = async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const file = req.file;

  const rules = {
    full_name: "required|min:4|max:15",
    status: "required|boolean"
  };

  try {
    const findUser = await modelUser.findById(id);
    if(!findUser) return Messages(res, 404, "User Not Found");

    await isValidator(body, rules, null, async(err, status) => {
      if(!status) return Messages(res, 412, { ...err, status });

      let payload = {};

      if(file) {
        const user_image = findUser._doc.image.url;
        const user_cloudinary_id = findUser._doc.image.cloudinary_id;
        
        if(user_image) await Cloudinary.uploader.destroy(user_cloudinary_id);

        // upload image to cloudinary
        const result = await Cloudinary.uploader.upload(file.path);
        
        // assign data secure_url & public_id to key image
        payload.image = {
          url: result.secure_url,
          cloudinary_id: result.public_id
        }
      };

      payload = { ...payload, ...body, full_name: req.body.full_name.trim() };

      const newData = await modelUser.findByIdAndUpdate(id, payload, { new: true });
      
      delete newData._doc.password;

      Messages(res, 200, "Update Success", newData);
    });
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  }
};

const deleteUser = async (req, res) => {
  const id = req.params.id;
  
  try {
    const findUser = await modelUser.findById(id);
    if(!findUser) return Messages(res, 404, "User Not Found");

    const user_image = findUser._doc.image.url;
    const user_cloudinary_id = findUser._doc.image.cloudinary_id;

    if(user_image) await Cloudinary.uploader.destroy(user_cloudinary_id);

    await modelUser.deleteOne({ _id: id });

    Messages(res, 200, `Delete (${findUser.full_name}) Success`);


  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  }
};

export { 
  allUsers, 
  registerUser, 
  loginUser, 
  logoutUser, 
  detailUser, 
  updateUser,
  deleteUser
};