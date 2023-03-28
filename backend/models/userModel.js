import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  { timestamp: true }
);

//Function used to check if password matches
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
  //compare(enteredPassword, hashedPassword): Compare the entered password with the hashed password stored in the database
  //If the entered password matches the hashed password, the method returns true, otherwise it returns false.
};

//Function used to encrypt the password before saving the created user to the database
userSchema.pre("save", async function (next) {
  //Before the save() method is called on a User document, execute this function
  if (!this.isModified) {
    //Check if the user data has been modified
    //- If not, it simply calls the next() function to move on to the next middleware function in the stack.
    next();
  }

  //If the user data has been modified, the function generates a salt using the bcrypt.genSalt() function
  //to create a random string that will be used as a basis for the hash of the password
  //The higher the number, the stronger salt will be generated. The second parameter is the number of rounds of hashing that will be applied to the password.
  //A higher number of rounds makes it more difficult for attackers to crack the password using brute-force methods
  const salt = await bcrypt.genSalt(10);

  //Hash the password using the salt, and assigns the hashed password back to the password field of the user document
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
