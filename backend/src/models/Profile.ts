import mongoose from "mongoose";


const ProfileSchema = new mongoose.Schema({
  bgColors: Array,                      // hex codes
  baseImages: Array,                    // image urls (ex canadian goose, the white goose, the cute brown one)
  accessories: Array,                    // image urls
  heldItems: Array,  
});

const Profile = mongoose.model("Profile", ProfileSchema);
export default Profile;