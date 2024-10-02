
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import Store from './Redux/Store';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce, ToastContainer } from 'react-toastify';
import UserWrapper from './Wrappers/UserWrapper';
import AdminWrapper from './Wrappers/AdminWrapper';


function App() {
  return (
  <Provider store={Store}>
    <Router>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce} // Corrected syntax here
        />

        <Routes>
          <Route path='/*' element={<UserWrapper/>}/>
          <Route path="admin/*" element={<AdminWrapper/>} />
        </Routes>
    </Router>
    

  </Provider>
    
    );
}

export default App;