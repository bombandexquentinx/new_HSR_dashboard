import { Route,Routes } from 'react-router-dom';
import ProtectedRoute from './utils/ProtectedRoutes';

import NotFoundPage from './pages/404';
import SigninPage from './pages/SigninPage';
import Dashboard from './pages/Dashboard';
import ReviewPage from "./pages/ReviewPage";
import Property from './pages/Property';
import PropertyOld from './pages/Property-old';
import Featured from "./pages/Featured";
import Service from "./pages/Services";
import Resource from "./pages/Resource";
import AddOns from "./pages/AddOns";
import InvoiceComponent from "./pages/InvoiceComponent";
import BookingOverview from "./pages/BookingOverview";
import LeadOverview from "./pages/LeadOverview";


export default function App (){
  return(
    <Routes>
      <Route path="/" element={<SigninPage/>}/>
      <Route path="/signin" element={<SigninPage/>}/>
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
      <Route path="/reviews" element={<ProtectedRoute><ReviewPage/></ProtectedRoute>}/>
      <Route path="/featured-listings" element={<ProtectedRoute><Featured/></ProtectedRoute>} />
      <Route path="/service-listings" element={<ProtectedRoute><Service/></ProtectedRoute>} />
      <Route path="/old-property-listings" element={<ProtectedRoute><Property/></ProtectedRoute>} />
      <Route path="/property-listings" element={<ProtectedRoute><PropertyOld/></ProtectedRoute>} />
      <Route path="/resource-listings" element={<ProtectedRoute><Resource/></ProtectedRoute>} />
      <Route path="/addons-listings" element={<ProtectedRoute><AddOns/></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute><InvoiceComponent/></ProtectedRoute>} />
      <Route path="/booking" element={<ProtectedRoute><BookingOverview/></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><LeadOverview/></ProtectedRoute>} />
      {/* Add other routes here */}
      <Route path="*" element={<NotFoundPage/>}/>
    </Routes>
  )
}