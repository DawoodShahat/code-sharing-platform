const express = require('express');
const router = express.Router();
const qs = require('querystring');
const SubCategory = require("../../models/subCategory");
const TopCategory = require("../../models/topCategory");


// models
const FileItem = require("../../models/fileItem");

// @route POST api/search
// @desc filters files based on top and sub category
// @access public
router.post("/search", (req, res) => {

    const topCtgName = req.body.top_ctg_name;
    const subCtgName = req.body.sub_ctg_name;

    if (topCtgName === 'select') {
        const query = qs.stringify({ errors: 'Specify the top category' });
        return res.redirect('/?' + query);
    }

    if (!subCtgName) {
        console.log(subCtgName);
        TopCategory.find({ top_ctg_name: topCtgName })
            .populate({
                path: 'sub_categories',
                populate: {
                    path: 'files',
                    model: 'Files',
                    populate: {
                        path: 'fileItems',
                        model: 'FileItem'
                    }
                }
            })
            .exec((err, doc) => {

                if (err) return res.json(err);
                console.log(doc[0].sub_categories[0]);
                console.log(doc[0].sub_categories[1]);

                const searchResults = doc.map(ctgItem => {
                    return ctgItem.sub_categories.map(subCtg => {
                        return subCtg.files.map(filesItem => {
                            return filesItem.fileItems.map(item => ({ objectID: item._id, fileName: item.fileName }))
                        });
                    });
                });


                return res.render('searchresults', {
                    pagetitle: 'Search Results',
                    hits: searchResults.flat(2)
                })
            });
    } else if (typeof subCtgName === 'string') {

            // return results based on filter: ctg: top, sub
            SubCategory.find({ sub_ctg_name: subCtgName })
                .populate({
                    path: 'files',
                    populate: {
                        path: 'fileItems',
                        model: 'FileItem'
                    }
                })
                .exec((err, doc) => {

                    const searchResults = doc[0].files.map(item => {
                        return item.fileItems.map(fileItem => {
                            return {
                                objectID: fileItem._id,
                                fileName: fileItem.fileName
                            };
                        });
                    });

                    res.render('searchresults', {
                        pagetitle: 'Search Results',
                        hits: searchResults
                    })

                });
        } else {
            // handle multiple file selection here
            const multipleQueryObj = subCtgName.map(ctg => ({ sub_ctg_name: ctg }));
            SubCategory.find({ $or: multipleQueryObj })
                .populate({
                    path: 'files',
                    populate: {
                        path: 'fileItems',
                        model: 'FileItem'
                    }
                })
                .exec((err, doc) => {

                    if (err) return res.json(err);

                    const searchResults = doc.map(ctgItem => {
                        return ctgItem.files.map(fileItem => {
                            return fileItem.fileItems.map(item => ({ objectID: item._id, fileName: item.fileName }));
                        });
                    });

                    res.render('searchresults', {
                        pagetitle: 'Search Results',
                        hits: searchResults.flat(1)
                    });
                });
        }

});

// @route GET api/search/:id
// @desc searches for a file based on it's id, then returns a viewable html to the front-end 
// @access public
router.get('/search/:id', (req, res) => {
    FileItem.find({ _id: req.params.id })
        .populate('files')
        .exec((err, doc) => {

            const author = doc[0].files.author;
            const dateCreated = doc[0].files.dateCreated;

            if (err) return res.json(err);
            res.render('resultview', {
                pagetitle: "File View",
                author: author,
                date: dateCreated,
                files: [{
                    fileName: doc[0].fileName,
                    stringFile: doc[0].bufferFile.toString(),
                    date: dateCreated,
                    author: author
                }]
            });
        });
});

module.exports = router;