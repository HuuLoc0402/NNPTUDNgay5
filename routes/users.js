var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');
let roleModel = require('../schemas/roles');

// GET - lấy tất cả users (không bao gồm những user đã xoá mềm)
router.get('/', async function (req, res, next) {
  try {
    let data = await userModel.find({
      isDeleted: false
    }).populate({
      path: 'role',
      select: 'id name description'
    });
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message
    })
  }
});

// GET - lấy user theo id (dùng field id hoặc _id)
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await userModel.findOne({
      isDeleted: false,
      $or: [{ id: id }, { _id: id }]
    }).populate({
      path: 'role',
      select: 'id name description'
    });
    if (result) {
      res.send(result)
    } else {
      res.status(404).send({
        message: "User NOT FOUND"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: error.message
    })
  }
});

// POST - tạo user mới
router.post('/', async function (req, res) {
  try {
    let newUser = new userModel({
      id: req.body.id,
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      status: req.body.status,
      role: req.body.role,
      loginCount: req.body.loginCount
    });
    await newUser.save();
    await newUser.populate({
      path: 'role',
      select: 'id name description'
    });
    res.send(newUser)
  } catch (error) {
    res.status(400).send({
      message: error.message
    })
  }
});

// PUT - update user theo id
router.put('/:id', async function (req, res) {
  try {
    let id = req.params.id;
    let updateData = {};
    let allowedFields = ['username', 'password', 'email', 'fullName', 'avatarUrl', 'status', 'role', 'loginCount', 'id'];
    
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        updateData[field] = req.body[field];
      }
    });

    let result = await userModel.findOneAndUpdate(
      { $or: [{ id: id }, { _id: id }] },
      updateData,
      { new: true }
    ).populate({
      path: 'role',
      select: 'id name description'
    });

    if (result) {
      res.send(result);
    } else {
      res.status(404).send({
        message: "User NOT FOUND"
      })
    }
  } catch (error) {
    res.status(400).send({
      message: error.message
    })
  }
});

// DELETE - xoá mềm user (set isDeleted = true)
router.delete('/:id', async function (req, res) {
  try {
    let id = req.params.id;
    let result = await userModel.findOneAndUpdate(
      { $or: [{ id: id }, { _id: id }] },
      { isDeleted: true },
      { new: true }
    );

    if (result) {
      res.send({
        message: "User deleted successfully",
        data: result
      })
    } else {
      res.status(404).send({
        message: "User NOT FOUND"
      })
    }
  } catch (error) {
    res.status(400).send({
      message: error.message
    })
  }
});

// POST /enable - enable user (set status = true)
router.post('/enable', async function (req, res) {
  try {
    let { email, username } = req.body;
    
    if (!email || !username) {
      return res.status(400).send({
        message: "Email and username are required"
      })
    }

    let result = await userModel.findOneAndUpdate(
      {
        email: email,
        username: username,
        isDeleted: false
      },
      { status: true },
      { new: true }
    ).populate({
      path: 'role',
      select: 'id name description'
    });

    if (result) {
      res.send({
        message: "User enabled successfully",
        data: result
      })
    } else {
      res.status(404).send({
        message: "User NOT FOUND or invalid credentials"
      })
    }
  } catch (error) {
    res.status(400).send({
      message: error.message
    })
  }
});

// POST /disable - disable user (set status = false)
router.post('/disable', async function (req, res) {
  try {
    let { email, username } = req.body;
    
    if (!email || !username) {
      return res.status(400).send({
        message: "Email and username are required"
      })
    }

    let result = await userModel.findOneAndUpdate(
      {
        email: email,
        username: username,
        isDeleted: false
      },
      { status: false },
      { new: true }
    ).populate({
      path: 'role',
      select: 'id name description'
    });

    if (result) {
      res.send({
        message: "User disabled successfully",
        data: result
      })
    } else {
      res.status(404).send({
        message: "User NOT FOUND or invalid credentials"
      })
    }
  } catch (error) {
    res.status(400).send({
      message: error.message
    })
  }
});

module.exports = router;
