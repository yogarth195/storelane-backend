const mongoose = require("mongoose");
const { Product } = require("../db");

const products = [
    {
        name: "USB Type-C Fast Charging Cable",
        price: 299,
        description: "A durable and fast-charging USB Type-C cable.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163526.jpg",
        units: 572,
        sub_categories: ["electronics", "usb", "accessories"]
    },
    {
        name: "High-Speed HDMI Cable",
        price: 499,
        description: "Supports 4K resolution and high-speed data transmission.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163553.jpg",
        units: 843,
        sub_categories: ["electronics", "hdmi", "accessories"]
    },
    {
        name: "Wireless Bluetooth Mouse",
        price: 750,
        description: "Ergonomic design with smooth connectivity.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163602.jpg",
        units: 634,
        sub_categories: ["electronics", "mouse", "computer accessories"]
    },
    {
        name: "Portable External Hard Drive 1TB",
        price: 899,
        description: "1TB storage with fast data transfer speeds.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163620.jpg",
        units: 421,
        sub_categories: ["electronics", "storage", "computer accessories"]
    },
    {
        name: "Gaming Keyboard with RGB Backlight",
        price: 849,
        description: "Mechanical keyboard with customizable RGB lighting.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163630.jpg",
        units: 500,
        sub_categories: ["electronics", "keyboard", "gaming accessories"]
    },
    {
        name: "128GB USB Flash Drive",
        price: 399,
        description: "Compact and high-speed USB flash drive.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163645.jpg",
        units: 780,
        sub_categories: ["electronics", "usb", "storage"]
    },
    {
        name: "Noise Cancelling Wireless Headphones",
        price: 999,
        description: "Premium audio quality with active noise cancellation.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163700.jpg",
        units: 315,
        sub_categories: ["electronics", "audio", "accessories"]
    },
    {
        name: "Multi-Port USB Hub",
        price: 350,
        description: "Expands a single USB port into multiple ports.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163711.jpg",
        units: 920,
        sub_categories: ["electronics", "usb", "accessories"]
    },
    {
        name: "Fast Wireless Charger Pad",
        price: 699,
        description: "Qi-certified wireless charging pad for smartphones.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163724.jpg",
        units: 450,
        sub_categories: ["electronics", "charger", "accessories"]
    },
    {
        name: "Smartwatch with Fitness Tracking",
        price: 950,
        description: "Tracks heart rate, steps, and notifications.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163733.jpg",
        units: 288,
        sub_categories: ["electronics", "wearable", "smart devices"]
    },
    {
        name: "High-Speed Ethernet Cable",
        price: 150,
        description: "Reliable and fast wired internet connection.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163747.jpg",
        units: 980,
        sub_categories: ["electronics", "network", "accessories"]
    },
    {
        name: "Laptop Cooling Pad with LED Fans",
        price: 450,
        description: "Prevents overheating and improves laptop performance.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163803.jpg",
        units: 330,
        sub_categories: ["electronics", "laptop accessories", "cooling"]
    },
    {
        name: "Compact Wireless Keyboard",
        price: 550,
        description: "Slim and portable wireless keyboard.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163820.jpg",
        units: 740,
        sub_categories: ["electronics", "keyboard", "accessories"]
    },
    {
        name: "Gaming Mouse with Customizable Buttons",
        price: 780,
        description: "Precision gaming mouse with adjustable DPI.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163831.jpg",
        units: 620,
        sub_categories: ["electronics", "mouse", "gaming accessories"]
    },
    {
        name: "64GB MicroSD Card",
        price: 299,
        description: "High-speed storage for phones and cameras.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163845.jpg",
        units: 875,
        sub_categories: ["electronics", "storage", "memory cards"]
    },
    {
        name: "USB-C to HDMI Adapter",
        price: 450,
        description: "Connects USB-C devices to HDMI displays.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163916.jpg",
        units: 455,
        sub_categories: ["electronics", "adapters", "usb"]
    },
    {
        name: "Webcam with 1080p Resolution",
        price: 849,
        description: "Crystal-clear video quality for online meetings.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163938.jpg",
        units: 523,
        sub_categories: ["electronics", "camera", "computer accessories"]
    },
    {
        name: "Ergonomic Laptop Stand",
        price: 620,
        description: "Adjustable height for better posture and cooling.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163949.jpg",
        units: 398,
        sub_categories: ["electronics", "laptop accessories", "ergonomic"]
    },
    {
        name: "Noise-Isolating In-Ear Earphones",
        price: 280,
        description: "Great sound quality with passive noise isolation.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20163958.jpg",
        units: 915,
        sub_categories: ["electronics", "audio", "accessories"]
    },
    {
        name: "USB LED Desk Lamp",
        price: 320,
        description: "Adjustable brightness with USB-powered design.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20164016.jpg",
        units: 790,
        sub_categories: ["electronics", "lighting", "accessories"]
    },
    {
        name: "USB-Powered Mini Fan",
        price: 150,
        description: "Compact and portable cooling fan.",
        imageUrl: "http://localhost:3000/images/Screenshot%202025-01-10%20164046.jpg",
        units: 870,
        sub_categories: ["electronics", "usb", "cooling"]
    }
];

console.log(new Date());

async function insertInDB() {
    try {
        //Insert
        // await Product.deleteMany({});
        await Product.insertMany(products);
        console.log("Products insertion success");
        console.log(new Date());
    } catch(err) {
        console.log("Error Inserting Products", err);
    } 
}

// Avoid multiple connections
if (mongoose.connection.readyState === 0) {
  mongoose.connect("mongodb+srv://yogarth:szA1uNFLlGiFWQUY@webwork.ng96r1f.mongodb.net/project_Web")
    .then(() => insertInDB())
    .catch(err => console.error("Connection error:", err));
} else {
  insertInDB();
}



