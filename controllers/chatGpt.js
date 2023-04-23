const mongoose = require('mongoose');
const User = mongoose.model('User');
const openAi = require('openai')
require("dotenv").config()

const Configuration = openAi.Configuration

const openai = new openAi.OpenAIApi(new Configuration({
    apiKey: process.env.API_KEY
}))

async function getResponse(string) {

    try {
        const gptRes = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages:[{role:"user", content: string}]
        })
        return gptRes.data.choices[0].message.content
    } catch (err) {
        return err
    }
}


const chatGpt = async (req,res) => {

    const {mainInfo, timeLength, timeType, extraInfo} = req.body


    const string = `Generate a detailed plan that teaches me ${mainInfo} in ${timeLength} ${timeType} with daily tasks
        The plan should use the following structure for every day:
      
      Goal:
      5 Objectives :
      10 Action Steps:
      Timeline:
      Resources
      Contigency Plan
    
        At the end you should provide some tips
        PS:${extraInfo}
         `
    
    console.log(extraInfo);

    try {
        const user = await User.findById(req.userId)
        
        if(user.planNumber === 0)
            return res.status(403).json({succes: false, message: "You don`t have any plans. Come on buy some!"})
        

        if(req.count === 2 && (req.query.planType === "Pro" || req.query.planType === "Free"))
            return res.status(403).json({succes: false, message: "You already have 2 plans generated."})
        else if(req.count === 3) 
            return res.status(403).json({succes: false, message: "You already have 3 plans generated."})

        if(req.query.planType !== "Enterprise")
        {
            user.planNumber--;
            await user.save()
        }
           
        const response = await getResponse(string)
        res.status(200).send(response)
    }
    catch (err) {
        res.status(500).json({succes: false, err: err})
    }
}


module.exports = chatGpt