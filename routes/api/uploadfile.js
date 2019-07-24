// imports
const express = require("express");
const router = express.Router();
const path = require('path');
const mongoose = require("mongoose");
const multer = require("multer");

const upload = multer({
    fileFilter: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        const allowedFiles = [".py", ".feature", ".yml", ".yaml", ".js", ".json", ".sql"];
        if (allowedFiles.includes(extension)) {
            cb(null, true);
        } else {
            cb(null, false);
            req.fileValidationError = "Not a valid file type, Supported files are" + allowedFiles;
        }
    }
});


// to avoid the deprecation warning
mongoose.set('useFindAndModify', false);

// models
const SubCategory = require("../../models/subCategory");
const TopCategory = require("../../models/topCategory");
const Files = require("../../models/files");
const FileItem = require("../../models/fileItem");

// query: all top categories available, adds it to res.locals
function queryAllCategories(req, res, next) {
    TopCategory.distinct("top_ctg_name", function (err, doc) {
        res.locals.topCategories = doc;
        next();
    });
}

// @route GET api/uploadfile
// @desc loads the share your files ui
// @access public
router.get("/uploadfile", queryAllCategories, (req, res) => {


    // if url contains errors, succesMsg query param
    const errorMsg = req.query.errors;
    const successMsg = req.query.successMsg;


    if (errorMsg) {
        res.render("uploadfile", {
            topCategories: res.locals.topCategories,
            pagetitle: "Share Your Files",
            error: errorMsg,
            successMsg: false
        })
    } else if (successMsg) {
        res.render('uploadfile', {
            topCategories: res.locals.topCategories,
            pagetitle: "Share Your Files",
            error: false,
            successMsg: successMsg
        })
    } else {
        res.render("uploadfile", {
            topCategories: res.locals.topCategories,
            pagetitle: "Share Your Files",
            error: false,
            successMsg: false
        });
    }

});


function validateFile(files, validationError) {
    if (!files.length && !validationError) {
        return "Select File";
    } else if (!files.length && validationError) {
        return validationError;
    }
    return false;
}

// @route POST api/uploadfile
// @desc saves files by author to the database
// @access public
router.post("/uploadfile", queryAllCategories,
    upload.array("test-file", 10),
    (req, res) => {


        const fileErrors = validateFile(req.files, req.fileValidationError);

        if (fileErrors) {
            return res.json({
                error: fileErrors
            });
        } else if (req.body.top_ctg_name === 'select') {
            return res.json({
                error: 'Specify the top category'
            });
        }

        // returns an array of keywords extracted from files to be uploaded
        // parameters: listOfFiles = req.files
        const extractKeywordsFromFiles = listOfFiles => {
            return listOfFiles.map(fileItem => {
                return fileItem.originalname.split(".")[0];
            });
        };

        // return an array of new FileItems
        // each of which can be save later, and it's _id added to the files Object
        const arrOfFileItems = (listOfFiles, filesId) => {
            return listOfFiles.map(fileItem => {
                return new FileItem({
                    _id: mongoose.Types.ObjectId(),
                    files: filesId,
                    fileName: fileItem.originalname,
                    bufferFile: fileItem.buffer
                });
            });
        };

        const createNewFiles = (fileItemIds, keywordsList, objectID) => {
            return new Files({
                _id: objectID,
                author: req.body.author,
                fileItems: fileItemIds,
                keywords: keywordsList
            })
        };

        // filesID to be used both by Files and FileItem
        const filesObjectID = mongoose.Types.ObjectId();

        const listOfFileItemsCreated = arrOfFileItems(req.files, filesObjectID);
        const listOfFileItemsIds = listOfFileItemsCreated.map(file => file._id);

        const newFiles = createNewFiles(listOfFileItemsIds, extractKeywordsFromFiles(req.files), filesObjectID);

        listOfFileItemsCreated.forEach(item => {
            item.save((err, result) => {
                if (err) res.json({ error: err });
            });
        });

        newFiles.save(result => {
            SubCategory.findOneAndUpdate(
                { sub_ctg_name: req.body.sub_ctg_name },
                {
                    $push: {
                        files: newFiles._id
                    }
                },
                {
                    new: true
                },
                (err, doc) => {
                    if (err) res.json({ error: err });
                    res.json({
                        successMsg: "New Files are Successfully Added"
                    })
                }
            );
        });
    });

module.exports = router;