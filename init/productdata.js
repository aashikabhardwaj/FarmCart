const mongoose = require("mongoose");
const Product = require("../models/product");
const productdata = require("./productdata");

mongoose.connect("mongodb://127.0.0.1:27017/farmcart")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("Connection Error:", err));

const products = [
    {
        name: "Tomato",
        image: "https://example.com/tomato.jpg",
        price: 40,
        quantity: "50kg",
        description: "Fresh organic tomatoes",
        category: "Vegetable",
        seller: "Farmer Ram",
        availability: true,
        ratings: 4.5
    },
    {
        name: "Mango",
        image: "https://example.com/mango.jpg",
        price: 120,
        quantity: "30kg",
        description: "Sweet Alphonso Mangoes",
        category: "Fruit",
        seller: "farmer Sita",
        availability: true,
        ratings: 4.8
    },
    {
        name: "Cow Milk",
        image: "https://example.com/milk.jpg",
        price: 60,
        quantity:"20L",
        description: "Fresh desi cow milk",
        category: "Dairy",
        seller: "Dairyseller Gopal",
        availability: true,
        ratings: 4.6
    },
    {
        name: "Potato",
        image: "https://example.com/potato.jpg",
        price: 30,
        quantity: "100kg",
        description: "Organic farm potatoes",
        category: "Vegetable",
        seller: "Farmer Lata",
        availability: true,
        ratings: 4.2
    },
    {
        name: "tulsi",
        image: "https://example.com/potato.jpg",
        price: 30,
        quantity: "100g",
        description: "Organic tulsi plants",
        category: "Plant",
        seller: "gardner munni",
        availability: true,
        ratings: 4.2
    },
    {
        name: "Brown sugar",
        image: "https://example.com/potato.jpg",
        price: 30,
        quantity: "60kg",
        description: "Organic brown sugar",
        category: "Other",
        seller: "Organic seller babita",
        availability: true,
        ratings: 4.2
    },
    {
        name: "Banana",
        image: "https://example.com/banana.jpg",
        price: 50,
        quantity: "60kg",
        description: "Fresh ripe bananas",
        category: "Fruit",
        seller: "Farmer Mohan",
        availability: true,
        ratings: 4.7
    },
    {
        name: "Spinach",
        image: "https://example.com/spinach.jpg",
        price: 25,
        quantity: "40kg",
        description: "Green leafy spinach",
        category: "Vegetable",
        seller: "Farmer Rekha",
        availability: true,
        ratings: 4.3
    },
    {
        name: "Paneer",
        image: "https://example.com/paneer.jpg",
        price: 300,
        quantity: "15kg",
        description: "Soft fresh paneer",
        category: "Dairy",
        seller: "Farmer Kishan",
        availability: true,
        ratings: 4.6
    },
    {
        name: "Wheat Flour",
        image: "https://example.com/wheatflour.jpg",
        price: 45,
        quantity: "200kg",
        description: "Stone-ground whole wheat flour",
        category: "Grain",
        seller: "Farmer Raju",
        availability: true,
        ratings: 4.4
    },
    {
        name: "Herbal Soaps",
        image: "https://example.com/soaps.jpg",
        price: 70,
        quantity: "150kg",
        description: "organic soaps with zero% chemical",
        category: "Other",
        seller: "retailer guppu",
        availability: true,
        ratings: 4.5
    },
    {
        name: "Honey",
        image: "https://example.com/honey.jpg",
        price: 250,
        quantity: "25kg",
        description: "Pure organic honey",
        category: "Other",
        seller: "Farmer Geeta",
        availability: true,
        ratings: 4.9
    }
];

Product.insertMany(products)
.then(() => {
    console.log("Products Added");
    mongoose.connection.close();
})
.catch(err => {
    console.log(err);
});
module.exports = {products : products};
