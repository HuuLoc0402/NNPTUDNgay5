var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles');
let userModel = require('../schemas/users');

// GET - lấy tất cả roles (không bao gồm những role đã xoá mềm)
router.get('/', async function (req, res, next) {
  try {
    let data = await roleModel.find({
      isDeleted: false
    });
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message
    })
  }
});

// GET - lấy role theo id (dùng field id hoặc _id)
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await roleModel.findOne({
      isDeleted: false,
      $or: [{ id: id }, { _id: id }]
    });
    if (result) {
      res.send(result)
    } else {
      res.status(404).send({
        message: "Role NOT FOUND"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: error.message
    })
  }
});

// POST - tạo role mới
router.post('/', async function (req, res) {
  try {
    let newRole = new roleModel({
      id: req.body.id,
      name: req.body.name,
      description: req.body.description
    });
    await newRole.save();
    res.send(newRole)
  } catch (error) {
    res.status(400).send({
      message: error.message
    })
  }
});

// PUT - update role theo id
router.put('/:id', async function (req, res) {
  try {
    let id = req.params.id;
    let updateData = {};
    let allowedFields = ['id', 'name', 'description'];
    
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        updateData[field] = req.body[field];
      }
    });

    let result = await roleModel.findOneAndUpdate(
      { $or: [{ id: id }, { _id: id }] },
      updateData,
      { new: true }
    );

    if (result) {
      res.send(result);
    } else {
      res.status(404).send({
        message: "Role NOT FOUND"
      })
    }
  } catch (error) {
    res.status(400).send({
      message: error.message
    })
  }
});

// DELETE - xoá mềm role (set isDeleted = true)
router.delete('/:id', async function (req, res) {
  try {
    let id = req.params.id;
    let result = await roleModel.findOneAndUpdate(
      { $or: [{ id: id }, { _id: id }] },
      { isDeleted: true },
      { new: true }
    );

    if (result) {
      res.send({
        message: "Role deleted successfully",
        data: result
      })
    } else {
      res.status(404).send({
        message: "Role NOT FOUND"
      })
    }
  } catch (error) {
    res.status(400).send({
      message: error.message
    })
  }
});

// GET - lấy tất cả users có role là id được truyền vào
router.get('/:id/users', async function (req, res, next) {
  try {
    let roleId = req.params.id;
    
    // Kiểm tra role có tồn tại không
    let role = await roleModel.findOne({
      isDeleted: false,
      $or: [{ id: roleId }, { _id: roleId }]
    });
    
    if (!role) {
      return res.status(404).send({
        message: "Role NOT FOUND"
      })
    }

    // Lấy tất cả users có role này
    let users = await userModel.find({
      isDeleted: false,
      role: role._id
    }).populate({
      path: 'role',
      select: 'id name description'
    });

    res.send(users);
  } catch (error) {
    res.status(500).send({
      message: error.message
    })
  }
});

module.exports = router;
