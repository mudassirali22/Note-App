import validator from "validator";

function validateSignup(req) {
    const {
        userName,
        email,
        password,
    } = req.body;

    if (!userName){
        throw new Error("Name is required")
    }else if(!validator.isEmail(email)){
        throw new Error("Invalid Email Address!")
    }else if(!validator.isStrongPassword(password)){
        throw new Error("Password is not strong enough")
    }
}



function validateLogin(req){ 
    const {email, password} = req.body;

    if(!validator.isEmail(email)){
        throw new Error("Invalid Email Address!")
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Password is not strong enough")
    }

}

function validateNotes(req) {

    const { title, description } = req.body;
        if (!title || !description ) {
         throw new Error("All feild are required")
        }
}



export { validateSignup, validateLogin, validateNotes };