require('./db/db.connection');

const express = require('express');
const app = express();
app.use(express.json());

const Restaurant = require('./models/restaurant.model');
const User = require('./models/user.model');

app.get('/',(req,res) => {
  res.send("Hello, Express!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Creating a Restaurant API
app.post('/restaurants', async (req,res) => {
  try{
    const { restaurant } = req.body;
    const newRestaurant = await createRestaurant(restaurant);
    res.status(201).json(
      {
        message: "Created Restaurant Successfully",
        restaurant: newRestaurant,
      }
    )
  }catch(e){
    res.status(500).json({ error: e.message });
  }
})

async function createRestaurant(restaurantData){
  try{
    const newRestaurant = new Restaurant(restaurantData);
    const restaurant = await newRestaurant.save();
    return restaurant;
  }catch(error){
    throw error;
  }
}

// Searching for Restaurants by Location API
app.get('/restaurants/search', async (req, res) => {
  try{
    const { location } = req.query;
    const restaurants = await searchRestaurantsByLocation(location);   
    if(restaurants){
      res.status(200).json({
        message: "Restaurant Found",
        restaurants,
      })
    }else{
      res.status(404).json({
        message: "No Restaurants Found",
      })
    }
  }catch(e){
    res.status(500).json({ error: e.message });
  }
})

async function searchRestaurantsByLocation(location){
  try{
    const restaurants = await Restaurant.findOne({ city: location });
    return restaurants;
  }catch(error){
    throw error;
  }
}

// Reading a Restaurant API
app.get('/restaurants/:name', async (req, res) => {
  try{
    const restaurantName = req.params.name;
    const restaurant = await readRestaurant(restaurantName);

    if(restaurant){
      res.status(200).json({
        message: "Restaurant Found",
        restaurant,
      });
    }else{
      res.status(404).json({
        message: "Restaurant Not Found"
      });
    }
  }catch(e){
    res.status(500).json({ error: e.message });
  }
})

async function readRestaurant(restaurantName){
  try{
    const foundRestaurant = await Restaurant.findOne({ name: restaurantName });
    return foundRestaurant;
  }catch(error){
    throw error;
  }
}

// Reading All Restaurants API
app.get('/restaurants', async (req, res) => {
  try{
    const allRestaurants = await readAllRestaurants();

    if(allRestaurants){
      res.status(200).json({
        message: "Restaurants Found",
        restaurants: allRestaurants,
      })
    }else{
      res.status(404).json({
        message: "No Restaurants Found",
      })
    }
  }catch(e){
    res.status(500).json({ error: e.message });
  }
})

async function readAllRestaurants(){
  try{
    const allRestaurants = await Restaurant.find();
    return allRestaurants;
  }catch(error){
    throw error;
  }
}

// Reading Restaurants by Cuisine API
app.get('/restaurants/cuisine/:cuisineType', async (req, res) => {
  try{
    const { cuisineType } = req.params;
    const restaurants = await readRestaurantsByCuisine(cuisineType);

    if(restaurants){
      res.status(200).json({
        message: "Restaurants with Cuisine Found",
        restaurants,
      })
    }else{
      res.status(404).json({
        message: "No Restaurants Found for cuisine"
      })
    }
  }catch(e){
    res.status(500).json({ error: e.message });
  }
})

async function readRestaurantsByCuisine(cuisineType){
  try{
    const restaurants = await Restaurant.find({ cuisine: cuisineType});
    return restaurants;
  }catch(error){
    throw error;
  }
}

// Updating a Restaurant API
app.post('/restaurants/:restaurantId', async (req, res) => {
  try{
    const { restaurantId } = req.params;
    const { updatedData } = req.body;
    const updatedRestaurantData = await updateRestaurant(restaurantId, updatedData);

    res.status(200).json({
      message: "Restaurant Updated",
      restaurant: updatedRestaurantData,
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
})

async function updateRestaurant(restaurantId, updatedData){
  try{
    const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, updatedData, { new: true });
    return restaurant;
  }catch(error){
    throw new Error("Restaurant Not Found");
  }
}

// Deleting a Restaurant API
app.delete('/restaurants/:restaurantId', async (req, res) => {
  try{
    const { restaurantId } = req.params;
    const deletedRestaurant = await deleteRestaurant(restaurantId);

    res.status(200).json({
      message: "Restaurant Deleted",
      restaurant: deletedRestaurant,
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
})

async function deleteRestaurant(restaurantId){
  try{
    await Restaurant.findByIdAndDelete(restaurantId);
    const restaurants = await Restaurant.find();
    return restaurants;
  }catch(error){
    throw new Error("Restaurant Not Found");
  }
}

// Filtering Restaurants by Rating
app.get('/restaurants/rating/:minRating', async (req, res) => {
  try{
    const { minRating } = req.params;
    const restaurants = await filterRestaurantsByRating(Number(minRating));

    if(restaurants.length){
      res.status(200).json({
        message: "Restaurants Found",
        restaurants,
      })
    }else{
      res.status(404).json({
        message: "No Restaurants Found"
      })
    }
  }catch(e){
    res.status(500).json({ error: e.message });
  }
})

async function filterRestaurantsByRating(rating){
  try{
    const restaurants = await Restaurant.find({ rating: { $gte: rating } });
    return restaurants;
  }catch(error){
    throw error;
  }
}

// Adding a Dish to a Restaurant's Menu API
app.post('/restaurants/:restaurantId/menu', async (req, res) => {
  try{
    const { restaurantId } = req.params;
    const { dish } = req.body;
    const restaurant = await addDishToMenu(restaurantId, dish);
    res.status(201).json({
      message: "Dish Added",
      restaurant
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
})

async function addDishToMenu(restaurantId, dish){
  try{
    const restaurant = await Restaurant.findById(restaurantId);
    restaurant.menu.push(dish);
    const updatedRestaurant = await restaurant.save();
    return updatedRestaurant;
  }catch(error){
    throw new Error("Restaurant Not Found")
  }
}

// Removing a Dish from a Restaurant's Menu API
app.delete('/restaurants/:restaurantId/menu/:dishName', async (req, res) => {
  try{
    const { restaurantId, dishName } = req.params;
    const restaurant = await removeDishFromMenu(restaurantId, dishName);
    res.status(200).json({
      message: "Deleted Dish from menu",
      restaurant,
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
})

async function removeDishFromMenu(restaurantId, dishName){
  try{
    const restaurant = await Restaurant.findById(restaurantId);
    
    const updatedMenu = restaurant.menu.filter((dish) => dish.name !== dishName);
    restaurant.menu = updatedMenu;
    const updatedRestaurant = await restaurant.save();
    return updatedRestaurant;
  }catch(error){
    throw new Error("Restaurant Not Found");
  }
}

// Add Reviews and Ratings for a Restaurant API
app.post('/restaurants/:restaurantId/reviews', async (req, res) => {
  try{
    const { restaurantId } = req.params;
    const { reviewData } = req.body;
      /* 
        const reviewData = {
          rating: Number,
          text: String,
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          }
        }
      */
    const restaurant = await addRestaurantReviewAndRating(restaurantId, reviewData);
    res.status(201).json({
      message: "Review Added",
      restaurant
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
})

async function addRestaurantReviewAndRating(restaurantId, reviewData){
  try{
    const restaurant = await Restaurant.findById(restaurantId);

    restaurant.reviews.push(reviewData);
    await restaurant.save();
    updateRestaurantRating(restaurant.reviews, restaurantId);
    const updatedRestaurant = await Restaurant.findById(restaurantId);
    return updatedRestaurant;
  }catch(error){
    throw new Error("Restaurant Not Found");
  }
}

async function updateRestaurantRating(reviews, restaurantId){
  try{
    const updatedAverageRating = (reviews.reduce((total,{rating}) => total + rating, 0))/reviews.length;
    const updatedData = {
      averageRating: updatedAverageRating
    };
    await Restaurant.findByIdAndUpdate(restaurantId, updatedData);
  }catch(error){
    throw error;
  }
}

// Retrieving User Reviews for a Specific Restaurant API
app.get('/restaurants/:restaurantId/reviews', async (req, res) => {
  try{
    const { restaurantId } = req.params;
    const reviews = await getUserReviewsForRestaurant(restaurantId);
    res.status(200).json({
      message: "Reviews Found",
      reviews
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
})

async function getUserReviewsForRestaurant(restaurantId){
  try{
    const restaurant = await Restaurant.findById(restaurantId).populate({
      path: 'reviews',
      populate: {
        path: 'userId',
        select: 'username profilePictureUrl',
      }
    });
    
    const allReviews = restaurant.reviews.map((review) => ({
      reviewText: review.text,
      user: review.userId,
    }));
    return allReviews;
  }catch(error){
    throw new Error("Restaurant Not Found");
  }
}