const express = require("express")
const authMiddleware = require("./middleware/authMiddleWare")
const cors = require("cors")
const cron = require('node-cron');



const admin = require("../firebase-config")
const { generateFourDigitCode, sendVerificationEmail } = require("./utils")




require("dotenv").config()
const port = process.env.PORT ||5000


//twillio
const accountSid = "ACbe7638a0e216d47d25f1d27463dfdc90";
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VAb71998345bdfd771e391e7c313f9649c";
const client = require("twilio")(accountSid, authToken);

const app = express()

const allowedOrigins = ["http://localhost:3000","https://mappool-9a59c.firebaseapp.com","https://mappool-9a59c.web.app"];

const corsOptions =  {
    origin:allowedOrigins,

}

app.use(cors(corsOptions))

app.use(authMiddleware)
app.use(express.json())



// send verification code to user, and store code in the backend
app.post("/ap1/v1/email-verification/send-email",async(req,res)=>{
    
     const code = generateFourDigitCode()
    //save code to database with the user as the id
    const data = {
        emailVerificationCode:code ,
        timeStamp: new Date()
    }

    const db = admin.firestore()

    try {
        const verificationCodeRef = db.collection("verificationCodes").doc(req.user.uid)
        await verificationCodeRef.set(data)
        
        sendVerificationEmail(req.body.email,code,(error)=>{
                if(error){
                    res.status(500).json({msg:"an error occured"})
                }else{
                    res.status(200).json({msg:"sent"})
                }
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "server error"})
    }
    
})


app.post("/ap1/v1/email-verification/validate-code",async(req,res)=>{
    
     
    //save code to database with the user as the id
    console.log(req.body)

    const db = admin.firestore()

    try {
        const verificationCodeRef = db.collection("verificationCodes").doc(req.user.uid)
        const verificationCode = await verificationCodeRef.get()
    
        if(verificationCode.data().emailVerificationCode === Number(req.body.token)){
            const userRef = db.collection("users").doc(req.user.uid)
            const userdata = (await userRef.get()).data()

           
            const verification = {
                ...userdata.verification,
                email: "completed"
            }
            await userRef.update({verification})
            res.status(200).json({mgs: "accepted"})
        }else{
            console.log("error")
            res.status(401).json({mgs: "unauthorized"})
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "server erroe"})
    }


    
})



// send verification to number
app.post("/ap1/v1/phone-verification/send-otp", (req,res)=>{

    client.verify.v2
    .services(verifySid)
    .verifications.create({ to: req.body.phone, channel: "sms" })
    .then((verification) => {
        console.log(verification.status)
        res.status(200).json({msg:verification.status })
    })
    .catch(e=>{
        console.log(e)
        res.status(500).json({msg: "server error"})
    })
    
})



// verify otp

app.post("/ap1/v1/phone-verification/validate-otp",async(req,res)=>{
    
     
    //save code to database with the user as the id
    console.log(req.body)

    const db = admin.firestore()

    client.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: req.body.phone , code: Number(req.body.token) })
    .then((verification_check) => console.log(verification_check.status))
    .then(async() =>{

        try {
 
            const userRef = db.collection("users").doc(req.user.uid)
            const userdata = (await userRef.get()).data()

           
            const verification = {
                ...userdata.verification,
                phoneNumber: "completed"
            }
            await userRef.update({verification})
            res.status(200).json({mgs: "accepted"})
        
        
    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "server erroe"})
    }
    }).catch(e=>{
        console.log(e)
        res.status(500).json({msg: "server error"})
    })

    


    
})


// Your function to be executed
function myFunction() {
    console.log('This function is executed every hour.');
    // Add your logic here
    sendVerificationEmail("noviceui@gmail.com","your server is active",(error)=>{
        if(error){
            res.status(500).json({msg:"an error occured"})
        }else{
            res.status(200).json({msg:"sent"})
        }
})
}
  
  // Schedule the function to run every hour
  cron.schedule('0 * * * *', myFunction);

app.listen(port,()=>{
    console.log(`listening on port ${port}`);
})