const jsonServer = require('json-server');
const auth = require('json-server-auth');
const cors = require('cors');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const jwt = require('jsonwebtoken');
const PORT = 8000;

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);
server.use(cors());

// Add custom routes before JSON Server router
server.use(jsonServer.bodyParser);
server.use(auth);
// Setup authentication routes
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user in the db.json
  const user = router.db.get('users').find({ email }).value();
  
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Create token
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 'your-secret-key', {
    expiresIn: '24h'
  });
  
  const { password: userPassword, ...userWithoutPassword } = user;
  
  return res.json({ token, user: userWithoutPassword });
});

server.post('/api/auth/register', (req, res) => {
  const { email, username, password } = req.body;
  
  // Check if user already exists
  const userExists = router.db.get('users').find({ email }).value();
  
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  // Create new user
  const newUser = {
    id: Date.now(),
    email,
    username,
    password,
    role: 'user',
    createdAt: new Date().toISOString()
  };
  
  // Add to db
  router.db.get('users').push(newUser).write();
  
  const { password: userPassword, ...userWithoutPassword } = newUser;
  
  return res.status(201).json(userWithoutPassword);
});

// Featured rooms endpoint
server.get('/api/rooms/featured', (req, res) => {
  // Get all rooms from the database
  const rooms = router.db.get('rooms').value() || [];
  
  // Add the 'featured' property and a single image to each room
  const featuredRooms = rooms.slice(0, 3).map((room, index) => ({
    ...room,
    featured: true,
    image: `https://images.unsplash.com/photo-${
      index === 0 ? '1566073771259-6a8506099945' : 
      index === 1 ? '1542314831-068cd1dbfeeb' : 
      '1551882547-ff40c63fe5fa'
    }?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80`
  }));
  
  return res.json(featuredRooms);
});

// Testimonials endpoint
server.get('/api/testimonials', (req, res) => {
  // Mock testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
      comment: "Our stay was absolutely perfect. The room was immaculate, the service exceptional, and the amenities exceeded all our expectations.",
      date: "2025-05-15T00:00:00.000Z"
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4,
      comment: "Beautiful hotel with fantastic staff. The breakfast was outstanding and the location was perfect for our city exploration.",
      date: "2025-04-22T00:00:00.000Z"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      rating: 5,
      comment: "We celebrated our anniversary here and the staff made it so special. The spa services were incredible and the room view was breathtaking.",
      date: "2025-03-10T00:00:00.000Z"
    }
  ];
  
  return res.json(testimonials);
});

// Promotions endpoint
server.get('/api/promotions', (req, res) => {
  // Mock promotions data
  const promotions = [
    {
      id: 1,
      title: "Summer Special",
      description: "Book 3 nights and get 20% off your entire stay. Perfect for your summer vacation!",
      discount: 20,
      validUntil: "2025-08-31T00:00:00.000Z",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      code: "SUMMER20"
    },
    {
      id: 2,
      title: "Weekend Getaway",
      description: "Enjoy a romantic weekend with 15% off and complimentary breakfast for two.",
      discount: 15,
      validUntil: "2025-09-30T00:00:00.000Z",
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      code: "WEEKEND15"
    }
  ];
  
  return res.json(promotions);
});

// Add custom middleware to check for JWT token
server.use('/api/reservations', (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    try {
      jwt.verify(token, 'your-secret-key');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Authorization header required' });
  }
});

// Use default router
server.use('/api', router);

// Start server
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});