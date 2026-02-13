import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Feed from './pages/Feed';
import { UserProvider } from './context/UserContext';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/recommended" element={<Feed />} />
                <Route path="/profile" element={
                  <div className="text-center py-20">
                    <h2 className="text-2xl font-bold">User Profile</h2>
                    <p className="text-slate-400 mt-2">Coming soon...</p>
                  </div>
                } />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
