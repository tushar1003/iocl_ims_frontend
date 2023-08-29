const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,  // Update with your SMTP server's hostname
  port: 587,  // The port number for the SMTP server
  secure: false,  // Set to true if your SMTP server requires a secure connection
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Create Prouct
const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, subcategory, quantity, maxQuantity, description } = req.body;

  //   Validation
  if (!name || !category || !quantity || !maxQuantity || !description || !subcategory) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    console.log(req.file);
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        
        folder: "Pinvent App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Create Product
  const product = await Product.create({
    user: req.user.id,
    name,
    sku,
    category,
    subcategory,
    quantity,
    maxQuantity,
    description,
    image: fileData,
  });
  if (quantity < maxQuantity / 2) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,  // Replace with the recipient's email
      subject: 'Low Quantity Alert',
      text: `The product "${name}" has a low quantity. Current quantity: ${quantity} and max quantity is: ${maxQuantity}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Low quantity email sent');
    } catch (error) {
      console.error('Error sending low quantity email:', error);
    }
  }
  res.status(201).json(product);
});

// Get all Products
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isDeleted: false }).sort("-createdAt");
  res.status(200).json(products);
});

// Get single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  // if (product.user.toString() !== req.user.id) {
  //   res.status(401);
  //   throw new Error("User not authorized");
  // }
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('User is not an admin');
  }
  res.status(200).json(product);
});

// Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('User is not an admin');
  }
  product.isDeleted=true;
  await product.save();
  res.status(200).json({ message: "Product deleted." });
});

// Update Product
const updateProduct = asyncHandler(async (req, res) => {
  const { name, category,subcategory, quantity, maxQuantity, description } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);

  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  // if (product.user.toString() !== req.user.id) {
  //   res.status(401);
  //   throw new Error("User not authorized");
  // }
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('User is not an admin');
  }
  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Pinvent App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Update Product
  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: id },
    {
      name,
      category,
      subcategory,
      quantity,
      maxQuantity,
      description,
      image: Object.keys(fileData).length === 0 ? product?.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (quantity < maxQuantity / 2) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,  // Replace with the recipient's email
      subject: 'Low Quantity Alert',
      text: `The product "${name}" has a low quantity. Current quantity: ${quantity} and max quantity is: ${maxQuantity}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Low quantity email sent');
    } catch (error) {
      console.error('Error sending low quantity email:', error);
    }
  }
  res.status(200).json(updatedProduct);
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
};
