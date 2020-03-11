const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Course = require('../models').Course;
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

/////////////////////////////////////////////////////////
/////////authentication middleware//////////////////////
const authenticateUser = async (req, res, next) => {
    let message = null;
    const credentials = auth(req)
    if(credentials){
        const user = await User.findOne({ where: { emailAddress: credentials.name}});
        if(user){
            const authenticated = bcryptjs.compareSync(credentials.pass, user.password)
            if(authenticated){
                console.log(`Authentication successful for username: ${user.emailAddress}`)
                req.user = user
            } else {
                message = `Authentication failure for username: ${user.username}`;
            }
        } else {
            message = `User not found for username: ${credentials.name}`;
        }
    } else {
        message = 'Auth header not found';
    }
    if(message){
        console.warn(message)
        res.status(401).json({message})
    } else{
        next();
    }
  }
/////////////////////////////////////////////////////////////////////////////////////
///user routes/////////////////////////////////////////////////////////////////////
/////////////////////////
router.get('/users', authenticateUser, async (req,res)=>{
    try {
        //////Use destructuring to create a filteredUser object withou password, createdAt or updated at.
        const {password,createdAt, updatedAt, ...filteredUser } = req.user.dataValues
        res.status(200).json({user: filteredUser})   
    } catch(err){
        res.status(500).send({Error: err.message})
    }
})


router.post('/users', async (req,res,next) => {
    try{
        if(req.body.password){
            req.body.password = await req.body.password.trim();
            if(req.body.password.length > 0){
                req.body.password = await bcryptjs.hashSync(req.body.password)
            }
        }
        const user = await User.create(req.body);
        res.status(201).location('/').end()
    } catch(err){
        err.status=400;
        next(err)
    }
})

///////////////////////////////////////////////////////////////////////////
//////////////////////course routes//////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
router.get('/courses', async (req, res)=> {
    try{
        const courses = await Course.findAll({
            include: [
                {
                  model: User
                },
              ]
        });

   
        let filteredCourses = [];
        for(let i = 0; i< courses.length; i++){
             //////Utilize destructuring to produce filteredCourses Array without createdAt or updated at
            let {createdAt, updatedAt, ...filteredCourse} = courses[i].dataValues;
            ///set associated user values so password, createdAt and updated at aren't returned
            filteredCourse.User = {
                id: filteredCourse.User.id,
                firstName: filteredCourse.User.firstName,
                lastName: filteredCourse.User.lastName,
                emailAddress: filteredCourse.User.emailAddress
            }
            filteredCourses.push(filteredCourse);
        }
        res.status(200).send(filteredCourses)
    } catch(err){
        res.status(500).send({err:err.message})
    }
})

router.get('/courses/:id', async (req, res)=> {
    try{
        const course = await Course.findAll({
            where: {
                id: req.params.id
            },
            include: [
                {
                    model: User
                }
            ]
        });
        //utilize destrucuring to remove createdAt and updatedAt from course object
        const {createdAt, updatedAt, ...filteredCourse} = course[0].dataValues;
        ///set associated user values so password, createdAt and updated at aren't returned
        filteredCourse.User = {
            id: filteredCourse.User.id,
            firstName: filteredCourse.User.firstName,
            lastName: filteredCourse.User.lastName,
            emailAddress: filteredCourse.User.emailAddress
        }
        

        res.status(200).json(filteredCourse)
    } catch(err){
        res.status(500).send({err:err.message})
    }
})

router.post('/courses', authenticateUser, async (req,res,next)=>{
    try{ 
        const course = await Course.create({
            title: req.body.title,
            description: req.body.description,
            estimatedTime: req.body.estimatedTime,
            materialsNeeded: req.body.materialsNeeded,
            userId: req.user.id
        })
        res.status(201).location(`/courses/${course.id}`).end()
    } catch(err){
        err.status=400
        next(err)
    }
})

router.put('/courses/:id', authenticateUser, async (req, res, next)=> {
    try{
        const course = await Course.findByPk(req.params.id);
        if(course.userId === req.user.id){
            if(req.body.title || req.body.description || req.body.estimatedTime || req.body.materialsNeeded){
                await course.update(req.body)
                res.status(204).send()  
            } else {
                    res.status(400).json({Error: "Oh no! There was an error with your update. You can only update title, description, estimated time, or the materials needed. Please try again"})
                }
        } else{
            res.status(403).send('Not authorized');
        }
    } catch(err){
        err.status=400;
        next(err)
    }
})

router.delete('/courses/:id', authenticateUser,async (req, res)=> {
    try{
        const course = await Course.findByPk(req.params.id);
        if(course.userId === req.user.id){
            await course.destroy();
            res.status(204).end();
        } else {
            res.status(403).send('Not authorized')
        }
    } catch(err){
        res.status(500).send({err:err.message})
    }
})


router.use(function (err, req, res, next) {
    res.status(err.status).send(err.message)
  })

module.exports = router;