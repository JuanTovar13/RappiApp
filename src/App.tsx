import {  Routes, Route } from "react-router-dom";

import {Login} from "./pages/auth/Login";
import {Register} from "./pages/auth/Register";
import {ConsumerStores} from "./pages/consumer/ConsumerStores";
import {StoreDashboard} from "./pages/store/StoreDashboard";
import {DeliveryDashboard} from "./pages/delivery/DeliveryDashboard";
import { StoreProducts } from "./pages/consumer/StoreProducts";

function App() {
  return (
    
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Register />} />

        <Route path="/consumer" element={<ConsumerStores />} />
        <Route
          path="/store-products/:storeId"
          element={<StoreProducts />}
        />

        <Route path="/store" element={<StoreDashboard />} />
        <Route path="/delivery" element={<DeliveryDashboard />} />

      </Routes>

  );
}

export default App;