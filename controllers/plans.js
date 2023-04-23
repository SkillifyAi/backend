const mongoose = require('mongoose');
const utils = require('./utils')
const Plan = require('../models/plan')
const User = mongoose.model('User')
const moment = require('moment')

const getAll = async (req, res, next) => {
    try {
        const plans = await Plan.find({user: req.userId})
        const user = await User.findById(req.userId)

        
        const plansTitle = plans.map(obj => ({
            skill: obj.skill,
            completed: obj.completed
        }))

        res.status(200).json({succes: true, titles: plansTitle, alternativePlans: user.alternativePlans})
    } catch(err) {
        res.status(500).json({succes: false, error: err})
    }
}

const getOnePlan = async (req, res) => {

    try {
        const plan = await Plan.findOne({user: req.userId, skill: req.params.id})
        if(!plan) 
            return res.status(404).json({succes: false, error:"The plan you are trying to acces doesn`t exist"})

        const planData = {
            content: plan.content,
            startDate: plan.createdAt,
            endDate: plan.endDate
        }
        
        res.status(200).json({succes: true, plan: planData})
    } catch (err) {
        res.status(500).json({succes: false, error: err})
    }
}

const savePlan = async (req, res, next) => {
    
    let endDate;
    if(req.body.timeType === 'days')
    {
        endDate = moment().add(req.body.timeLength, 'days')
    } else if(req.body.timeType === 'weeks') {
        endDate = moment().add(req.body.timeLength, 'weeks')
    } else if(req.body.timeType === 'months') {
        endDate = moment().add(req.body.timeLength, 'months')
    }
    try {
        let plan = await Plan.findOne({skill: req.body.mainInfo, user: req.userId})
        let counter = 1;
        while(plan)
        {
            counter++;
            req.body.mainInfo = req.body.mainInfo + ' ' + counter
            plan = await Plan.findOne({skill: req.body.mainInfo, user: req.userId})
        }
            
    } catch(err) {
        res.status(500).json({succes: false, error: err})  
    }
    
    const newPlan = new Plan({
        skill: req.body.mainInfo,
        user: req.userId,
        content: req.body.aiResponse,
        endDate: endDate
    })

    try {
        await newPlan.save()
        res.status(200).json({succes: true})
    } catch (err) {
        res.status(500).json({succes: false, error: err})  
    }
}

const updatePlan = async (req, res) => {
    try {
        const plan = await Plan.findOne({skill: req.params.id, user: req.userId})
        if(!plan) {
            res.status(404).json({succes: false, error: 'Plan not found'})
        }
        plan.content = req.body.content
        await plan.save()
        res.status(200).json({succes: true})
    } catch (err) {
        res.status(500).json({succes: false, error: err})
    }
}


const deletePlan = async (req, res) => {

    try {
        const user = await User.findById(req.userId)
        const plan = await Plan.findOne({user: req.userId, skill: req.params.id})
        console.log(plan.completed);
        if(user.alternativePlans == 0 && !plan.completed)
            return res.status(403).json({succes:false, error: "You can`t delete any more plans this month"})
        

        if(!plan.completed && user.planType !== "Enterprise")
        {
            user.alternativePlans--;
            await user.save()
        }

        await plan.remove()

        res.status(200).json({succes: true})
    } catch (err) {
        res.status(500).json({succes: false, error: err})
    }
}

const planCompleted = async (req, res) => {
    try {
        const plan = await Plan.findOne({user: req.userId, skill: req.params.id})

        plan.completed = true
        await plan.save()
        res.status(200).json({succes: true})
    } catch (err){
        res.status(500).json({succes: false, error: err})
    }
    
}
const planNumber = async (req, res, next) => {
    try {
        const count = await Plan.countDocuments({user: req.userId})
        req.count = count
        next()
    } catch (err) {
        res.status(500).json({succes: false, error: err})
    }
}


const rememberDay = async (req, res) => {
    try {
        const plan = await Plan.findOne({user: req.userId, skill: req.params.id})
        if(!plan) 
            return res.status(404).json({succes: false, error: 'Plan not found'})
        
        const searchDay = plan.daysCompleted.find(date => moment(date).isSame(moment(req.body.day), 'day'))

        if(searchDay)
            return res.status(200)

        plan.daysCompleted.push(req.body.day)
        await plan.save()    
        return res.status(200).json({succes: true})
    } catch (err) {
        res.status(500).json({succes: false, error: "Something went wrong"})
    }
}

const getDates = async (req, res) => {
    try {
        const plan = await Plan.findOne({user: req.userId, skill: req.params.id})
        if(!plan) 
            return res.status(404).json({succes: false, error: 'Plan not found'})
        return res.status(200).json({succes: true, days: plan.daysCompleted})
    } catch (err) {
        res.status(500).json({succes: false, error: "Something went wrong"})
    }
}
module.exports = {
    getAll,
    getOnePlan,
    savePlan,
    updatePlan,
    deletePlan,
    planNumber,
    rememberDay,
    getDates,
    planCompleted
}