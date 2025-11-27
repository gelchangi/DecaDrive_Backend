# DecaDrive Backend

**Production-ready Node.js + Express backend for DecaDrive** — a driving school lessons and order management system.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Database Seeding](#database-seeding)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [Endpoints](#endpoints)
  - [Request Examples](#request-examples)
  - [Response Format](#response-format)
  - [Error Handling](#error-handling)
- [Database Schema](#database-schema)
- [Validation Rules](#validation-rules)
- [Testing with Postman](#testing-with-postman)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Additional Documentation](#additional-documentation)

---

## Overview

DecaDrive Backend provides a RESTful API for managing driving school lessons and student orders. The system handles lesson inventory, student bookings, automatic space availability tracking, and atomic order processing with transaction support.

Built for CST3144 coursework, this backend demonstrates:

- RESTful API design principles
- MongoDB database operations with native driver
- Transaction handling for data consistency
- Input validation and error handling
- Production deployment readiness

---

## Features

✅ **Lesson Management**

- List all available driving lessons
- Search lessons by subject or location
- Sort lessons by multiple criteria (subject, location, price, spaces)
- Update lesson details (price, availability, description)
- View individual lesson details

✅ **Order Processing**

- Place orders with multiple lesson items
- Automatic inventory management (space decrementing)
- Atomic transactions for data consistency
- Order validation (customer info, availability checks)
- Automatic total calculation

✅ **Data Integrity**

- MongoDB transactions for atomic updates (when supported)
- Fallback rollback strategy for standalone environments
- Conditional updates to prevent overbooking
- Comprehensive input validation

✅ **Production Ready**

- CORS configuration for frontend integration
- Environment-based configuration
- Structured error responses
- Health check endpoint
- Render.com deployment support

---

## Tech Stack

| Technology  | Version | Purpose                  |
| ----------- | ------- | ------------------------ |
| **Node.js** | 14+     | JavaScript runtime       |
| **Express** | ^4.18   | Web framework            |
| **MongoDB** | ^5.8    | Database (native driver) |
| **dotenv**  | ^16.0   | Environment variables    |
| **cors**    | ^2.8    | Cross-origin requests    |
| **nodemon** | ^2.0    | Development auto-reload  |

**Note:** No TypeScript or ODM (Mongoose) — intentionally minimal and using native MongoDB driver for educational clarity.

---

## Project Structure

```
decadrive-backend/
├── server.js                   # Main Express application entry point
├── package.json                # Dependencies and scripts
├── .env.example                # Environment variable template
├── README.md                   # This file
├── DELIVERED.md                # Deliverables checklist
├── config/
│   └── mongo.js                # MongoDB connection helper
├── routes/
│   ├── lessons.js              # Lesson endpoint routing
│   └── orders.js               # Order endpoint routing
├── controllers/
│   ├── lessonsController.js    # Lesson business logic
│   └── ordersController.js     # Order processing & validation
├── scripts/
│   └── seed.js                 # Database seeding script
├── postman/
│   └── CST3144_DecaDrive_backend.postman_collection.json
└── docs/
    ├── IMPLEMENTATION_NOTES.md # Technical implementation details
    └── DEPLOY.md               # Render.com deployment guide
```

---

## Getting Started

### Prerequisites

- **Node.js** v14.0 or higher ([Download](https://nodejs.org/))
- **npm** v6.0 or higher (comes with Node.js)
- **MongoDB Atlas** account ([Sign up free](https://www.mongodb.com/cloud/atlas))
- **Git** (optional, for version control)

### Installation

1. **Clone or download this repository**

```bash
cd /path/to/decadrive-backend
```

2. **Install dependencies**

```bash
npm install
```

This installs:

- Production dependencies: `express`, `mongodb`, `cors`, `dotenv`
- Development dependencies: `nodemon`

### Environment Configuration

1. **Create `.env` file from template**

```bash
cp .env.example .env
```

2. **Configure environment variables**

Edit `.env` and set your values:

```bash
# Server port (optional, defaults to 3000)
PORT=3000

# MongoDB connection string (REQUIRED)
# Get this from MongoDB Atlas: Database > Connect > Drivers
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/decadrive?retryWrites=true&w=majority

# Frontend URL for CORS (REQUIRED for production)
# Use '*' for development, specific origin for production
FRONTEND_URL=http://localhost:3000
# FRONTEND_URL=https://your-frontend.onrender.com
```

**MongoDB Atlas Setup:**

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user (Database Access)
3. Whitelist your IP or use `0.0.0.0/0` for testing (Network Access)
4. Get connection string from "Connect" button → "Connect your application"
5. Replace `<username>`, `<password>`, and database name

### Database Seeding

**Seed the database with sample driving lessons:**

```bash
# Using environment variable
npm run seed

# Or pass connection string directly
node scripts/seed.js "mongodb+srv://user:pass@cluster.mongodb.net/decadrive"
```

**What the seed script does:**

- Clears existing `lessons` collection
- Inserts 10 sample driving lessons (Manual Beginner, Night Driving, Mock Test, etc.)
- Each lesson includes: subject, location, price, available spaces, description, and Unsplash placeholder image
- Outputs inserted count and lesson IDs

**Sample lessons include:**

- Manual Beginner (Flic en Flac) - $20
- Automatic Beginner (Port Louis) - $18
- Night Driving Practice (Port Louis) - $30
- Highway Confidence (Grand Baie) - $28
- Parking & Reversing (Curepipe) - $15
- And 5 more...

---

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

Uses `nodemon` to automatically restart on file changes.

### Production Mode

```bash
npm start
```

### Verify Server is Running

Open browser or curl:

```bash
curl http://localhost:3000/
# Expected: {"status":"ok"}
```

---

## API Documentation

### Base URL

- **Local:** `http://localhost:3000`
- **Production:** `https://your-app.onrender.com`

### Endpoints

#### 1. **GET /lessons**

List all lessons with optional filtering and sorting.

**Query Parameters:**

- `q` (optional) — Case-insensitive search on `subject` and `location`
- `sortBy` (optional) — Sort field: `subject`, `location`, `price`, or `spaces`
- `order` (optional) — Sort direction: `asc` (default) or `desc`

**Response:** `200 OK`

```json
[
  {
    "_id": "6543210abcdef...",
    "subject": "Manual Beginner",
    "location": "Flic en Flac",
    "price": 20,
    "spaces": 8,
    "description": "Introductory manual driving course for beginners.",
    "image": "https://source.unsplash.com/800x600/?driving,car,manual"
  }
]
```

#### 2. **GET /lessons/:id**

Get a single lesson by ID.

**Parameters:**

- `id` (path) — MongoDB ObjectId

**Response:** `200 OK` or `404 Not Found`

```json
{
  "_id": "6543210abcdef...",
  "subject": "Manual Beginner",
  "location": "Flic en Flac",
  "price": 20,
  "spaces": 8,
  "description": "Introductory manual driving course for beginners.",
  "image": "https://source.unsplash.com/800x600/?driving,car,manual"
}
```

#### 3. **PUT /lessons/:id**

Partially update a lesson.

**Parameters:**

- `id` (path) — MongoDB ObjectId

**Request Body (all fields optional):**

```json
{
  "subject": "Manual Advanced",
  "location": "Grand Baie",
  "price": 25,
  "spaces": 10,
  "description": "Updated description",
  "image": "https://new-image-url.com/image.jpg"
}
```

**Response:** `200 OK` (updated document) or `404 Not Found`

#### 4. **POST /orders**

Create a new order.

**Request Body:**

```json
{
  "name": "Alice Johnson",
  "phone": "12345678",
  "items": [
    { "lessonId": "6543210abcdef...", "quantity": 2 },
    { "lessonId": "7654321fedcba...", "quantity": 1 }
  ]
}
```

**Response:** `201 Created`

```json
{
  "status": "success",
  "orderId": "9876543210abc...",
  "total": 62
}
```

**Error Response:** `400 Bad Request`

```json
{
  "error": "Insufficient spaces for lesson 6543210abcdef..."
}
```

### Request Examples

**Search for beginner lessons:**

```bash
curl 'http://localhost:3000/lessons?q=beginner'
```

**Sort by price descending:**

```bash
curl 'http://localhost:3000/lessons?sortBy=price&order=desc'
```

**Get specific lesson:**

```bash
curl http://localhost:3000/lessons/6543210abcdef1234567890
```

**Create an order:**

```bash
curl -X POST http://localhost:3000/orders \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Alice Johnson",
    "phone": "12345678",
    "items": [
      {"lessonId": "6543210abcdef1234567890", "quantity": 1}
    ]
  }'
```

**Update lesson spaces:**

```bash
curl -X PUT http://localhost:3000/lessons/6543210abcdef1234567890 \
  -H 'Content-Type: application/json' \
  -d '{"spaces": 15}'
```

### Response Format

All responses are JSON.

**Success responses:**

- `200 OK` — Successful GET/PUT
- `201 Created` — Successful POST (order created)

**Error responses:**

- `400 Bad Request` — Validation error, insufficient spaces, invalid input
- `404 Not Found` — Lesson not found, invalid ID
- `500 Internal Server Error` — Database or server error

### Error Handling

All errors return JSON with an `error` field:

```json
{
  "error": "Error message description"
}
```

**Common error scenarios:**

| Error                   | Status | Cause                                     |
| ----------------------- | ------ | ----------------------------------------- |
| `Invalid name`          | 400    | Name contains non-alphabetic characters   |
| `Invalid phone`         | 400    | Phone not 6-15 digits                     |
| `Invalid quantity`      | 400    | Quantity not a positive integer           |
| `Insufficient spaces`   | 400    | Not enough lesson spaces available        |
| `Not found`             | 404    | Invalid lesson ID or lesson doesn't exist |
| `Internal server error` | 500    | Database connection or server issue       |

---

## Database Schema

### `lessons` Collection

```javascript
{
  _id: ObjectId,           // Auto-generated MongoDB ID
  subject: String,         // e.g., "Manual Beginner"
  location: String,        // e.g., "Flic en Flac"
  price: Number,           // Lesson price (e.g., 20)
  spaces: Number,          // Available spaces (integer)
  description: String,     // Lesson description
  image: String            // Unsplash placeholder URL
}
```

### `orders` Collection

```javascript
{
  _id: ObjectId,           // Auto-generated order ID
  name: String,            // Customer name (letters and spaces only)
  phone: String,           // Phone number (6-15 digits)
  items: [                 // Array of ordered items
    {
      lessonId: ObjectId,  // Reference to lessons._id
      quantity: Number     // Number of spaces booked
    }
  ],
  total: Number,           // Computed total price
  timestamp: Date          // Order creation time
}
```

---

## Validation Rules

### Order Validation

**`name` field:**

- Letters (A-Z, a-z) and spaces only
- Non-empty after trimming
- Cannot contain numbers or special characters
- **Example valid:** `"Alice Johnson"`, `"Bob Smith"`
- **Example invalid:** `"Alice123"`, `"Bob@Smith"`, `""`

**`phone` field:**

- Digits only (0-9)
- Length between 6-15 characters
- No spaces, hyphens, or country codes with +
- **Example valid:** `"12345678"`, `"1234567890123"`
- **Example invalid:** `"123-456"`, `"+1234567"`, `"12345"`

**`items` array:**

- Non-empty array
- Each item must have valid `lessonId` (ObjectId format)
- Each `quantity` must be integer >= 1
- Lesson must exist in database
- Lesson must have sufficient `spaces` available

**Availability check:**

- Before processing order, system verifies `lesson.spaces >= quantity`
- If insufficient, returns `400` error
- On success, atomically decrements `spaces` by `quantity`

---

## Testing with Postman

### Import Collection

1. Open Postman
2. Click **Import** → **File**
3. Select `postman/CST3144_DecaDrive_backend.postman_collection.json`
4. Collection appears with 4 pre-configured requests

### Set Environment Variable

1. Create Postman environment or use collection variables
2. Set `BASE_URL` to:
   - Local: `http://localhost:3000`
   - Production: `https://your-app.onrender.com`

### Included Requests

1. **List lessons** — GET all lessons
2. **Search lessons (q=beginner)** — Filter example
3. **Create order** — POST order (replace `<lessonId>` with actual ID)
4. **Update lesson (partial)** — PUT to modify spaces

### Testing Workflow

1. **Start server:** `npm run dev`
2. **Seed database:** `npm run seed`
3. **Get lessons:** Run "List lessons" request → copy a lesson `_id`
4. **Create order:** Update `<lessonId>` in "Create order" request body → send
5. **Verify:** Run "List lessons" again → confirm `spaces` decremented
6. **Test overbooking:** Set `quantity` higher than available `spaces` → expect `400` error

---

## Deployment

### Render.com Deployment

See detailed guide in `docs/DEPLOY.md`.

**Quick steps:**

1. **Create Render web service**

   - Connect GitHub repo or upload code
   - Select **Node** environment

2. **Configure build & start**

   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

3. **Set environment variables**

   - `MONGO_URI` — Your MongoDB Atlas connection string
   - `FRONTEND_URL` — Your frontend URL (e.g., `https://frontend.onrender.com`)
   - `PORT` — (optional, Render sets this automatically)

4. **Deploy**

   - Render builds and starts your app
   - Health check endpoint: `/` returns `{"status":"ok"}`

5. **Update MongoDB Atlas**
   - Add Render's IP to Network Access whitelist
   - Or use `0.0.0.0/0` (allow all) for testing

**Important:** Ensure your MongoDB cluster supports transactions (Atlas replica set) for full atomicity. Standalone servers will use fallback rollback strategy.

---

## Troubleshooting

### Common Issues

**1. `MONGO_URI not set in environment`**

- **Solution:** Create `.env` file with valid `MONGO_URI`
- Verify connection string format includes username, password, and database name

**2. `Failed to connect to database`**

- **Solution:** Check MongoDB Atlas Network Access whitelist
- Verify username/password in connection string
- Test connection string in MongoDB Compass

**3. `No matching version found for mongodb`**

- **Solution:** We use `mongodb@^5.8.0` — run `npm install` again
- Check Node.js version (needs v14+)

**4. Port already in use (EADDRINUSE)**

- **Solution:** Change `PORT` in `.env` or kill process using port 3000

```bash
lsof -ti:3000 | xargs kill -9
```

**5. CORS errors from frontend**

- **Solution:** Set `FRONTEND_URL` in `.env` to match your frontend origin
- For development, can use `FRONTEND_URL=*` (allows all origins)

**6. `Insufficient spaces` when spaces are available**

- **Solution:** Race condition or stale data — reload lesson first
- Check if another order processed simultaneously
- See `docs/IMPLEMENTATION_NOTES.md` for concurrency details

**7. Seed script hangs**

- **Solution:** Check MongoDB connection
- Verify `MONGO_URI` is correct
- Ensure MongoDB Atlas cluster is running

---

## Additional Documentation

- **`docs/IMPLEMENTATION_NOTES.md`** — Technical details on transaction handling, concurrency, rollback strategy, and race condition considerations
- **`docs/DEPLOY.md`** — Step-by-step Render.com deployment guide with environment configuration
- **`DELIVERED.md`** — Project deliverables checklist and acceptance test criteria

---

## Scripts Reference

| Script  | Command        | Description                               |
| ------- | -------------- | ----------------------------------------- |
| `start` | `npm start`    | Start production server                   |
| `dev`   | `npm run dev`  | Start development server with auto-reload |
| `seed`  | `npm run seed` | Seed database with sample lessons         |
| `test`  | `npm test`     | (Placeholder - no tests configured)       |

---

## Notes

### Unsplash Placeholder Images

The seed script uses Unsplash's placeholder image service:

```
https://source.unsplash.com/800x600/?driving,car,<keyword>
```

These URLs:

- Return random driving/car-related images
- Work directly in HTML `<img>` tags
- Are free to use for development/testing
- May show different images on each load (cache for consistency in production)

For production, consider:

- Uploading custom lesson images to cloud storage (AWS S3, Cloudinary)
- Replacing URLs in database after deployment

### Transaction Support

- **MongoDB Atlas (replica set):** Full transaction support — atomicity guaranteed
- **Standalone MongoDB:** Transactions not supported — uses conditional updates with manual rollback
- See `docs/IMPLEMENTATION_NOTES.md` for detailed explanation

---

## License

MIT

---

## Questions?

For coursework support:

- Review inline code comments in `controllers/` and `routes/` files
- Check `docs/IMPLEMENTATION_NOTES.md` for technical explanations
- Test endpoints with Postman collection
- Review acceptance tests in `DELIVERED.md`

**Remember:** All source files include detailed comments explaining validation rules, transaction handling, and API behavior — use these during your demo presentation.
