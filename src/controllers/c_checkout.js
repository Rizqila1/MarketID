import modelCheckout from "../models/m_checkout.js";
import Messages from "../utils/messages.js";
import isValidator from "../utils/validator.js";

const createCheckout = async (req, res) => {
  const body = req.body;
  const invoice = `INVOICE${Date.now()}`;

  // Get data user from custom response in middleware => auth.js
  const user = { ...res.checkout_user };

  // Assign property into body request
  body.invoice = invoice;
  body.user = user;
  body.status = false;

  const rules = {
    invoice: "required",
    user: {
      _id: "required",
      full_name: "required",
      email: "required",
    },
    cart: "required",
    address: {
      _id: "required",
      name: "required",
    },
    status: "required|boolean",
    total: "required|numeric",
  };

  try {
    await isValidator({ ...body }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      await new modelCheckout(body).save();

      Messages(res, 201, "Checkout Success", { invoice });
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

const allCheckout = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const filter = { invoice: { $regex: q, $options: "i" } };

    const total = await modelCheckout.count(filter);
    const data = await modelCheckout
      .find(filter)
      .sort({ _id: sort_key })
      .skip(pages)
      .limit(per_page);

    // add total income
    const currentTotal = data.map((item) => item.total);
    let incomes = undefined;
    if (currentTotal.length) {
      incomes = currentTotal.reduce(
        (accumulator, currentValue) => accumulator + currentValue
      );
    }

    Messages(
      res,
      200,
      "All Data",
      { incomes, data },
      {
        page,
        per_page,
        total,
      }
    );
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  }
};

const historyCheckout = async (req, res) => {
  const id = req.params.id;

  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const filter = { invoice: { $regex: q, $options: "i" } };

    const total = await modelCheckout.count({
      $and: [{ "user._id": id }, filter],
    });

    const data = await modelCheckout
      .find({
        $and: [{ "user._id": id }, filter],
      })
      .sort({ _id: sort_key })
      .skip(pages)
      .limit(per_page);

    // add total income
    const currentTotal = data.map((item) => item.total);
    let total_expense = undefined;
    if (currentTotal.length) {
      total_expense = currentTotal.reduce(
        (accumulator, currentValue) => accumulator + currentValue
      );
    }

    Messages(
      res,
      200,
      "All Data",
      { total_expense, data },
      {
        page,
        per_page,
        total,
      }
    );
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  }
};

const detailCheckout = async (req, res) => {
  const invoice = req.params.invoice;

  try {
    const filter = { invoice: { $regex: invoice, $options: "i" } };

    const findByInvoice = await modelCheckout.findOne(filter);
    if (!findByInvoice) return Messages(res, 404, "Invoice not found");

    Messages(res, 200, "Detail Checkout", findByInvoice);
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  }
};

const confirmCheckout = async (req, res) => {
  const invoice = req.params.invoice;
  const status = req.body.status;

  const rules = {
    status: "required|boolean",
  };
  try {
    const filter = { invoice: { $regex: invoice, $options: "i" } };

    const findByInvoice = await modelCheckout.findOne(filter);
    if (!findByInvoice) return Messages(res, 404, "Invoice not found");

    await isValidator({ status }, rules, null, async (err, state) => {
      if (!state) return Messages(res, 412, { ...err, state });

      const data = await modelCheckout.findOneAndUpdate(
        filter,
        { status },
        { new: true }
      );

      Messages(res, 200, "Confirmation Success", data);
    });
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  }
};

const deleteCheckout = async (req, res) => {
  const invoice = req.params.invoice;

  try {
    const filter = { invoice: { $regex: invoice, $options: "i" } };

    const findByInvoice = await modelCheckout.findOne(filter);
    if (!findByInvoice) return Messages(res, 404, "Invoice not found");

    await modelCheckout.deleteOne(filter);

    Messages(res, 200, "Delete Checkout Success");
  } catch (error) {
    Messages(res, 500, error?.messages || "Internal Server Error");
  }
};

export {
  createCheckout,
  allCheckout,
  historyCheckout,
  detailCheckout,
  confirmCheckout,
  deleteCheckout,
};
