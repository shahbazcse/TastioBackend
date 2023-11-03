const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cuisine: [{
    type: String,
    enum: ["Indian", "Italian", "Chinese", "Mexican", "Thai", "Japanese", "French"],
  }],
  address: String,
  city: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  menu: [{
    name: String,
    price: Number,
    description: String,
    isVeg: Boolean,
  }],
  averageRating: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      rating: Number,
      text: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    }
  ]
}, {
  timestamps: true,
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;