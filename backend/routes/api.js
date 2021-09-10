const express = require ('express');
const psl = require('psl');
const router = express.Router();
const Url = require('../models/url');

// the get action
router.get('/url', (req, res, next) => {

    res.json({
        error: "Hello there."
    });

    /*
    Url.find({})
        .then(data => res.json(data))
        .catch(next);
    */

});

router.get('/:urlShort', (req, res, next) => {

        // /api/urlLong/[urlShort]
        // if urlShort is not given, it would take the /url route line 6

        // at first let's check if there is such url
        Url.countDocuments({urlShort: req.params.urlShort}, function (err, count) {

            // must be at least one
            if(count == 1){
                // match
                Url.findOne({"urlShort": req.params.urlShort})
                    .then(data => res.redirect(301, data.urlLong))
                    .catch(next);
            } else {
                // zero or more entries for that
                // but more cant be because those are unique according to schema
                res.json({
                    error: "There is no such urlShort."
                });
            }
        }); 

});

router.get('/urlQrCode/:urlShort', (req, res, next) => {

        // /api/urlQrCode/[urlShort]
        // returns the qr code

        // at first let's check if there is such url
        Url.countDocuments({urlShort: req.params.urlShort}, function (err, count) {

            // must be at least one
            if(count == 1){
                // match
                Url.findOne({"urlShort": req.params.urlShort})
                    .then(data => res.json(data.urlQrCode))
                    .catch(next);
            } else {
                // zero or more entries for that
                // but more cant be because those are unique according to schema
                res.json({
                    error: "There is no such urlShort."
                });
            }
        }); 

});

// shorten a new url
router.post('/newUrlLong', (req, res, next) => {

    // check if there is any input
    if(req.body.urlLong && req.body.urlLong.length > 0){
        
        // to extract the hostname

        // if this is no valid url it will throw exception
        try {
            const { hostname } = new URL(req.body.urlLong);

            // now check if its a valid top level domain
            if (psl.isValid(hostname)) {
                
                // prevent recursive behaviour
                if(hostname != "2a5.de") {
            
                    // lookup if already there
                    Url.countDocuments({urlLong: req.body.urlLong}, function (err, count) {

                        if(count > 0){
                            // match
                            // return the exisiting one
                            Url.findOne({"urlLong": req.body.urlLong})
                                .then(data => res.json(data))
                                .catch(next);

                        } else {
                            // zero or more entries for that
                            // but more cant be because those are unique according to schema

                            Url.create(req.body)
                                .then(data => res.json(data))
                                .catch(next)
                        }
                    });

                } else {
                    res.json({
                        error: "2a5 as input is not allowed."
                    });
                }

            } else {
                res.json({
                    error: "This is no valid URL."
                });
            }
        } catch (error) {
            res.json({
                error: "This is no URL."
            });
        }

    } else {
        // if it's empty

        res.json({
            error: "There is no url given."
        })

    }

});

/*
router.delete('/url/:id', (req, res, next) => {
  Url.findOneAndDelete({"_id": req.params.id})
    .then(data => res.json(data))
    .catch(next)
});
*/

module.exports = router;
