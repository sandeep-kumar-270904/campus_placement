import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold text-primary mb-4">Welcome to PLACEearly</h1>
      <p className="text-lg text-secondary">Career & Campus Placement Management Platform</p>
      <div className="mt-8 space-x-4">
        <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Login</Link>
        <Link to="/register" className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Register</Link>
      </div>
    </div>
  );
}

function Login() {
  return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Login Page</h2></div>;
}

function Register() {
  return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Register Page</h2></div>;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
