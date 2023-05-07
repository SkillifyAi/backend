const mongoose = require('mongoose');
const User = mongoose.model('User');
const openAi = require('openai')
require("dotenv").config()

const Configuration = openAi.Configuration

const openai = new openAi.OpenAIApi(new Configuration({
    apiKey: process.env.API_KEY
}))

async function getResponse(string, timeDuration) {

    try {
        
        let output = "" 
        let completion = false

        const gptRes = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages:[{role:"user", content: string + `Don' stop until you reach day ${Math.ceil(timeDuration / 2) + 3}`}],     
        })
        
        
        const text = gptRes.data.choices[0].message.content
        output += text
        

        while(true)
        {
            const rows = output.split('\n')
            const goalRows = rows.filter(row => row.startsWith('Goal:'))
    
            let message = `You already covered the first ${Math.ceil(timeDuration / 2)} days
            Some points you already outlined are:
    
            ${goalRows.map((item, index) => `Day \n ${index + 1}: ${item} \n`)}
            
            `
            const gptRes2 = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages:[{role:"user", content: string + message + `Don' stop until you reach day ${timeDuration}`}],     
            })
            
            output += gptRes2.data.choices[0].message.content
            
            if(gptRes2.data.choices[0].finish_reason === "stop")
                break
        }
        return output
    } catch (err) {
        console.log(err);
        return err
    }

    
}


const chatGpt = async (req,res) => {

    const {mainInfo, timeLength, timeType, extraInfo} = req.body
    let timeDuration;
    if(timeType === "months")
        timeDuration = 30 * timeLength
    else if(timeType === "weeks") 
        timeDuration = 7 * timeLength
    else 
        timeDuration = timeLength;

    const string = `
    Generate a detailed plan that teaches me ${mainInfo} in ${timeDuration} days with daily tasks
    The plan should use the following structure for every day:
  
    Goal:
    2 Objectives :
    10 Action Steps:
    Timeline:
    Resources
    Contigency Plan

    At the end you should provide some tips
    PS:${extraInfo} 
    `

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
           
        const response = await getResponse(string, timeDuration)
        res.status(200).send(response)
    }
    catch (err) {
        res.status(500).json({succes: false, err: err})
    }
}


module.exports = chatGpt