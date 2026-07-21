import { createContext, useContext, useState } from 'react';

const initialFarms = [
  { name: 'Green Valley Farm', owner: 'John Smith', crop: 'Wheat', soil: 'Clay', robot: 'AgriBot-001', status: 'Active', cls: 'active', size: '120 acres', cropTypes: 'Wheat, Barley', devices: '3', coordinates: [{ lat: 36.7845, lng: -119.4190 }, { lat: 36.7860, lng: -119.4130 }, { lat: 36.7830, lng: -119.4070 }, { lat: 36.7770, lng: -119.4060 }, { lat: 36.7720, lng: -119.4100 }, { lat: 36.7735, lng: -119.4180 }] },
  { name: 'Sunrise Orchards', owner: 'Sarah Johnson', crop: 'Apples', soil: 'Loam', robot: 'AgriBot-002', status: 'Active', cls: 'active', size: '85 acres', cropTypes: 'Apples, Pears', devices: '2', coordinates: [{ lat: 47.7575, lng: -120.7400 }, { lat: 47.7590, lng: -120.7330 }, { lat: 47.7560, lng: -120.7270 }, { lat: 47.7500, lng: -120.7260 }, { lat: 47.7455, lng: -120.7300 }, { lat: 47.7465, lng: -120.7390 }] },
  { name: 'Golden Harvest', owner: 'Michael Brown', crop: 'Corn', soil: 'Sandy', robot: 'AgriBot-003', status: 'Active', cls: 'active', size: '200 acres', cropTypes: 'Corn, Soybeans', devices: '4', coordinates: [{ lat: 41.8845, lng: -93.0980 }, { lat: 41.8860, lng: -93.0900 }, { lat: 41.8835, lng: -93.0830 }, { lat: 41.8770, lng: -93.0825 }, { lat: 41.8725, lng: -93.0860 }, { lat: 41.8740, lng: -93.0970 }] },
  { name: 'Maple Ridge Farm', owner: 'John Smith', crop: 'Soybeans', soil: 'Loam', robot: 'AgriBot-004', status: 'Active', cls: 'active', size: '150 acres', cropTypes: 'Soybeans, Wheat', devices: '2', coordinates: [{ lat: 40.6395, lng: -89.3985 }, { lat: 40.6410, lng: -89.3910 }, { lat: 40.6380, lng: -89.3840 }, { lat: 40.6320, lng: -89.3845 }, { lat: 40.6275, lng: -89.3880 }, { lat: 40.6290, lng: -89.3980 }] },
  { name: 'River Bend Agriculture', owner: 'Emily Davis', crop: 'Rice', soil: 'Clay', robot: 'AgriBot-005', status: 'Active', cls: 'active', size: '180 acres', cropTypes: 'Rice, Corn', devices: '3', coordinates: [{ lat: 34.7535, lng: -92.2895 }, { lat: 34.7550, lng: -92.2820 }, { lat: 34.7520, lng: -92.2750 }, { lat: 34.7460, lng: -92.2745 }, { lat: 34.7415, lng: -92.2775 }, { lat: 34.7420, lng: -92.2890 }] },
  { name: 'Highland Crops', owner: 'David Wilson', crop: 'Corn', soil: 'Loam', robot: 'AgriBot-006', status: 'Active', cls: 'active', size: '220 acres', cropTypes: 'Corn, Wheat', devices: '5', coordinates: [{ lat: 41.4995, lng: -99.9020 }, { lat: 41.5010, lng: -99.8950 }, { lat: 41.4980, lng: -99.8880 }, { lat: 41.4920, lng: -99.8875 }, { lat: 41.4875, lng: -99.8905 }, { lat: 41.4885, lng: -99.9010 }] },
  { name: 'Coastal Farms', owner: 'Sarah Johnson', crop: 'Strawberries', soil: 'Sandy', robot: 'AgriBot-007', status: 'Active', cls: 'active', size: '60 acres', cropTypes: 'Strawberries, Tomatoes', devices: '2', coordinates: [{ lat: 44.9495, lng: -123.0355 }, { lat: 44.9510, lng: -123.0280 }, { lat: 44.9480, lng: -123.0210 }, { lat: 44.9420, lng: -123.0205 }, { lat: 44.9385, lng: -123.0240 }, { lat: 44.9390, lng: -123.0350 }] },
  { name: 'Valley View Ranch', owner: 'Michael Brown', crop: 'Alfalfa', soil: 'Loam', robot: 'AgriBot-008', status: 'Active', cls: 'active', size: '300 acres', cropTypes: 'Alfalfa, Hay', devices: '4', coordinates: [{ lat: 31.9755, lng: -99.9020 }, { lat: 31.9770, lng: -99.8950 }, { lat: 31.9740, lng: -99.8880 }, { lat: 31.9680, lng: -99.8875 }, { lat: 31.9635, lng: -99.8905 }, { lat: 31.9645, lng: -99.9010 }] },
];

const FarmContext = createContext(null);

export function FarmProvider({ children }) {
  const [farms, setFarms] = useState(initialFarms);

  const addFarm = (farm) => setFarms((prev) => [...prev, farm]);
  const updateFarm = (oldFarm, newData) =>
    setFarms((prev) => prev.map((f) => (f === oldFarm ? { ...f, ...newData } : f)));
  const removeFarm = (farm) => setFarms((prev) => prev.filter((f) => f !== farm));

  return (
    <FarmContext.Provider value={{ farms, addFarm, updateFarm, removeFarm }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarms() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error('useFarms must be used within FarmProvider');
  return ctx;
}
