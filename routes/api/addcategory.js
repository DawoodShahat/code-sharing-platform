const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const { check, validationResult } = require('express-validator');

const TopCategory = require("../../models/topCategory");
const SubCategory = require("../../models/subCategory");

// @route GET api/subcategories
// @desc returns subcategories based on selected top category
// @access public
router.get("/subcategories/:topCtgName", (req, res) => {
    TopCategory.find({ top_ctg_name: req.params.topCtgName })
        .populate('sub_categories')
        .exec((err, doc) => {

            if (err) {
                return res.json(err);
            }

            // adds sub categories to an array of strings
            const subCtgs = doc[0].sub_categories.map(item => {
                return {
                    itemValue: item.sub_ctg_name,
                    itemName: item.sub_ctg_name.toUpperCase()
                }
            });

            res.json({
                sub_categories: subCtgs
            });
        });
});



// @route GET api/addcategory
// @desc loads Add Category UI
// @access public
router.get("/addcategory", (req, res) => {
    res.render('addcategory', {
        pagetitle: 'Add Category',
        categoryFunction: [
            { title: 'Add Top Category', url: '/api/addtopcategory' },
            { title: 'Add Sub Category', url: '/api/addsubcategory' }
        ]
    });
});

// @route GET api/addtopcategory
// @desc loads Add Top Category UI
// @access public
router.get("/addtopcategory", (req, res) => {
    res.render("topcategory", {
        pagetitle: "Add Top Category",
        successMsg: false,
        error: false
    });
});

// @route POST api/addtopcategory
// @desc saves new Top Category to db
// @access public
router.post("/addtopcategory", [
    check('top_ctg_name').matches(/.*\S.*/)
], (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('topcategory', {
            pagetitle: "Add Top Category",
            successMsg: false,
            error: errors.array()[0].msg
        })
    }

    const newTopCategory = new TopCategory({
        _id: mongoose.Types.ObjectId(),
        top_ctg_name: req.body.top_ctg_name
    });

    newTopCategory.save((err, ctg) => {
        if (err) return res.json({ error: err });
        res.render('topcategory', {
            pagetitle: "Add Top Category",
            successMsg: `${req.body.top_ctg_name} Category Added`
        })
    });
});

// move it to one place so that modularity can be improved, it's also in uploadfile.js
// queries all categories available -- middleware
// adds the queried result to res.locals
function queryAllCategories(req, res, next) {
    TopCategory.distinct("top_ctg_name", function (err, doc) {
        res.locals.topCategories = doc;
        next();
    });
}


// @route GET api/addsubcategory
// @desc loads Add Sub Category UI
// @access public
router.get("/addsubcategory", queryAllCategories, (req, res) => {
    res.render("subcategory", {
        topCategories: res.locals.topCategories,
        pagetitle: "Add Sub Category",
        successMsg: false,
        error: false
    });
});

// @route POST api/addsubcategory
// @desc saves new Sub Category to db
// @access public
router.post("/addsubcategory", queryAllCategories, [
    check('sub_ctg_name').matches(/.*\S.*/)
], (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('subcategory', {
            topCategories: res.locals.topCategories,
            pagetitle: "Add Sub Category",
            successMsg: false,
            error: errors.array()[0].msg
        })
    }

    const newSubCategory = new SubCategory({
        _id: mongoose.Types.ObjectId(),
        sub_ctg_name: req.body.sub_ctg_name
    });

    // saves new subcategory to db, and updates the specified top category according to sub categ
    newSubCategory.save((err, ctg) => {
        if (err) res.json({ error: err });
        TopCategory.findOneAndUpdate(
            { top_ctg_name: req.body.top_ctg_name },
            {
                $push: {
                    sub_categories: newSubCategory._id
                }
            },
            {
                new: true
            },
            (err, doc) => {
                if (err) res.json({ error: err });
                res.render('subcategory', {
                    topCategories: res.locals.topCategories,
                    pagetitle: "Add Sub Category",
                    successMsg: "Sub Category is Successfully Added",
                    error: false,
                })
            }
        );
    });
});


module.exports = router;