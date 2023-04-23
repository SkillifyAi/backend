const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    skill: String,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}   ,
    content: String,
    createdAt: { type: Date, default: Date.now },
    endDate: Date,
    daysCompleted: [{type: Date}],
    completed: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Plan', PlanSchema)