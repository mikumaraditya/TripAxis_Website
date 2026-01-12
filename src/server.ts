import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Request, Response, NextFunction } from 'express'; 
import { join } from 'node:path'; 
import { promises as fs } from 'fs'; 

// --- START OF NEW RAZORPAY & CRYPTO IMPORTS ---
import Razorpay from 'razorpay';
import crypto from 'crypto';
// --- END OF NEW RAZORPAY & CRYPTO IMPORTS ---


// --- START OF AUTHENTICATION LOGIC ---

// Lazy-loaded auth libs
let bcrypt: any;
let jwt: any;
let authInitialized = false;

const JWT_SECRET = process.env['JWT_SECRET'] || 'af653f8g7h8j9k0lmnoqprstuvwxyz';

// Ensure paths work in both dev and prod
const projectRoot = join(import.meta.dirname, '..');
const DATA_DIR = join(projectRoot, 'data');
const LOGIN_FILE = join(DATA_DIR, 'login.json');
const BOOKINGS_FILE = join(DATA_DIR, 'bookings.json'); 

interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
}

interface LoginData {
  users: User[];
}

// THIS FUNCTION IS NOW ASYC, AWAIT WILL BE USED
async function initAuth(): Promise<void> {
  if (authInitialized) return;

  const bcryptModule = await import('bcryptjs');
  bcrypt = bcryptModule?.default ?? bcryptModule;

  const jwtModule = await import('jsonwebtoken');
  jwt = jwtModule?.default ?? jwtModule;

  // Ensure data directory and files exist
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  try {
    await fs.access(LOGIN_FILE);
  } catch {
    await fs.writeFile(LOGIN_FILE, JSON.stringify({ users: [] }, null, 2));
  }
  
  try {
    await fs.access(BOOKINGS_FILE);
  } catch {
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify({ bookings: [] }, null, 2));
  }

  authInitialized = true;
}

async function readLoginData(): Promise<LoginData> {
  const data = await fs.readFile(LOGIN_FILE, 'utf-8');
  return JSON.parse(data) as LoginData;
}

async function writeLoginData(data: LoginData): Promise<void> {
  await fs.writeFile(LOGIN_FILE, JSON.stringify(data, null, 2));
}

async function findUserByEmail(email: string): Promise<User | undefined> {
  const data = await readLoginData();
  return data.users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

async function saveUser(user: Omit<User, 'id'>): Promise<User> {
  const data = await readLoginData();
  const newUser = {
    ...user,
    id: Math.random().toString(36).substr(2, 9), // Simple ID generation
  };
  data.users.push(newUser);
  await writeLoginData(data);
  return newUser;
}

// Routers
const authRouter = express.Router();

// --- 'register' IS NOW FULLY ASYNC ---
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await initAuth();
    const { fullName, email, password } = req.body as { fullName: string; email: string; password: string };
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await saveUser({ fullName, email, password: hashedPassword });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      message: 'User created successfully!',
      token,
      userId: newUser.id
    });
  } catch (err) {
    return next(err); 
  }
});

// --- 'login' IS NOW FULLY ASYNC ---
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await initAuth();
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token, userId: user.id });
  } catch (err) {
    return next(err);
  }
});

// Auth request interface
interface AuthRequest extends Request {
  userData?: { userId: string; email: string };
}

// --- 'checkAuth' IS NOW FULLY ASYNC ---
const checkAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await initAuth();
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication failed: No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided.' });
    }

    const decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    req.userData = decodedToken;
    return next(); 
  } catch (err) {
    return res.status(401).json({ message: 'Authentication failed: Invalid token.' });
  }
};
// --- END OF AUTHENTICATION LOGIC ---


// --- START OF NEW RAZORPAY LOGIC ---

// !!IMPORTANT!! Get these from your Razorpay Test Dashboard
process.env['RAZORPAY_KEY_ID'] = process.env['RAZORPAY_KEY_ID'] || 'rzp_test_RZkFQFg5TFUWQ4';
process.env['RAZORPAY_KEY_SECRET'] = process.env['RAZORPAY_KEY_SECRET'] || '0cr9VzMCmhebP0eYi1Th9CJH';

const razorpay = new Razorpay({
  key_id: process.env['RAZORPAY_KEY_ID'],
  key_secret: process.env['RAZORPAY_KEY_SECRET'],
});

const paymentRouter = express.Router(); // Create a new router for payments

/**
 * @route POST /api/payment/create-order
 * @desc Creates a Razorpay order and returns it
 */
paymentRouter.post('/create-order', checkAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Get both item and formValue
    const { item, formValue } = req.body as { item: any, formValue: any };
    
    // 2. Validate all new data
    if (!item || !item.price || !formValue || !formValue.travelers) {
      return res.status(400).json({ message: 'Missing item details, price, or traveler count.' });
    }

    // 3. Calculate the final price
    const basePrice = Number(item.price);
    const travelers = Number(formValue.travelers);
    const totalPrice = basePrice * travelers;

    const options = {
      amount: totalPrice * 100, 
      currency: "INR", 
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json(order); 

  } catch (err) {
    console.error("Razorpay order creation error:", err);
    return next(err); 
  }
});

/**
 * @route POST /api/payment/verify-payment
 * @desc Verifies the payment signature and saves the booking
 */
paymentRouter.post('/verify-payment', checkAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  
  try {
    await initAuth(); 
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      item,
      formValue 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment details.' });
    }

    const shasum = crypto.createHmac('sha256', process.env['RAZORPAY_KEY_SECRET']!);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      console.warn("Signature mismatch");
      return res.status(400).json({ message: 'Invalid signature. Payment verification failed.' });
    }

    console.log("Payment successful, saving booking...");
    const data = await fs.readFile(BOOKINGS_FILE, 'utf-8');
    const bookingsData = JSON.parse(data);

    // +++ START OF UPDATED DESCRIPTION LOGIC +++
    // This now ONLY saves the name/title, country, and duration.
    let itemDescription = item.name || item.title;
    if (item.country) {
      itemDescription += `, ${item.country}`; 
    }
    
    if (item.duration) { 
      itemDescription += ` (${item.duration})`; // 
    }

    const newBooking = {
      bookingId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'SUCCESS',
      amount: item.price * Number(formValue.travelers), 
      userEmail: req.userData?.email,
      fullName: formValue.fullName,
      phoneNumber: formValue.phoneNumber,
      travelDate: formValue.travelDate,
      endDate: formValue.endDate, 
      travelers: formValue.travelers,
      item: itemDescription, 
      imageUrl: item.imageUrl, 
      timestamp: new Date().toISOString()
    };

    bookingsData.bookings.push(newBooking);
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookingsData, null, 2));
    console.log("Booking saved successfully.");

    return res.status(200).json({ 
      message: 'Booking successful and verified.',
      bookingId: razorpay_payment_id
    });

  } catch (err) {
    console.error("Payment verification error:", err);
    return next(err); 
  }
});

/**
 * @route GET /api/payment/booking/:id
 * @desc Gets a specific booking's details, owned by the logged-in user
 */
paymentRouter.get('/booking/:id', checkAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await initAuth(); 
    
    const bookingId = req.params['id']; 
    
    const userEmail = req.userData?.email;

    if (!userEmail) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    const data = await fs.readFile(BOOKINGS_FILE, 'utf-8');
    const bookingsData = JSON.parse(data);

    // Find the booking that matches both the ID and the logged-in user's email
    const booking = bookingsData.bookings.find(
      (b: any) => b.bookingId === bookingId && b.userEmail === userEmail
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or access denied.' });
    }

    return res.status(200).json(booking); 

  } catch (err) {
    console.error("Get booking error:", err);
    return next(err); 
  }
});

// --- END OF NEW RAZORPAY LOGIC ---


const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json()); // 

/**
 * Define API endpoints here.
 */
app.use('/api/auth', authRouter); // 
app.use('/api/payment', paymentRouter); 


/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error?: Error) => { 
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);