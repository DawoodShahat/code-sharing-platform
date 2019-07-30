const express = require('express');
const router = express.Router();
// const qs = require('querystring');
// const SubCategory = require("../../models/subCategory");
// const TopCategory = require("../../models/topCategory");


// models
// const FileItem = require("../../models/fileItem");
const Files = require("../../models/files");

router.get('/confirmfiles', (req, res) => {

    // Files.find({ isConfirmed: false })
    //     .populate({
    //         path: 'subCtg',
    //         populate: {
    //             path: 'topCtg',
    //             model: 'TopCategory',
    //         }
    //     })
    //     .exec((err, doc) => {
    //         console.log(doc);
    //     });


    Files.find({ isConfirmed: false }, (err, doc) => {
        const filteredResults = doc.map(filesItem => {
            return {
                objectID: filesItem._id,
                author: filesItem.author,
                fileNames: filesItem.keywords
            }
        });

        res.render('filesconfirmation', {
            pagetitle: 'Review Files',
            filesForReview: filteredResults
        })
    });
});

// @route POST api/confirmfiles
// @desc accepts and decline files based on user input
// @access public
router.post("/confirmfiles", (req, res) => {
    const { objectID, action } = req.body;

    if (action === 'accept') {
        Files.findByIdAndUpdate(objectID, { isConfirmed: true }, (err, docs) => {
            if(err) return res.json({ msg: err })
            return res.json({ msg: "success" });
        });
    } else if (action === 'decline') {
        Files.findByIdAndDelete(objectID, (err, docs) => {
            if(err) return res.json({ msg: err })
            return res.json({ msg: "success" });
        })
    }

});


module.exports = router;