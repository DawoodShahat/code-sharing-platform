// imports
const express = require('express');
const router = express.Router();
const TopCategory = require("../../models/topCategory");

// queries top and sub categories -- middleware
// adds the queried result to res.locals
function queryAllCategories(req, res, next) {
    TopCategory.distinct("top_ctg_name", function (err, doc) {
        res.locals.topCategories = doc;
        SubCategory.distinct("sub_ctg_name", function (err, doc) {
            res.locals.subCategories = doc;
            next();
        });
    });
}


// @route GET api/
// @desc loads the home page ui
// @access public
router.get("/", queryAllCategories, (req, res) => {
    const errorMsg = req.query.errors;

    if (errorMsg) {
        return res.render("index", {
            topCategories: res.locals.topCategories,
            subCategories: res.locals.subCategories,
            pagetitle: "App",
            error: errorMsg
        })
    }
    res.render("index", {
        topCategories: res.locals.topCategories,
        subCategories: res.locals.subCategories,
        pagetitle: "App",
        error: false
    });
});


module.exports = router;