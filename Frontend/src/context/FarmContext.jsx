import { createContext, useContext, useState } from 'react';

const initialFarms = [
  { name: 'Green Valley Farm', owner: 'John Smith', crop: 'Wheat', soil: 'Clay', location: 'California, USA', robot: 'AgriBot-001', status: 'Active', cls: 'active', size: '120 acres', cropTypes: 'Wheat, Barley', devices: '3', coordinates: [{ lat: 36.7783, lng: -119.4179 }, { lat: 36.7850, lng: -119.4100 }, { lat: 36.7720, lng: -119.4050 }] },
  { name: 'Sunrise Orchards', owner: 'Sarah Johnson', crop: 'Apples', soil: 'Loam', location: 'Washington, USA', robot: 'AgriBot-002', status: 'Active', cls: 'active', size: '85 acres', cropTypes: 'Apples, Pears', devices: '2', coordinates: [{ lat: 47.7511, lng: -120.7401 }, { lat: 47.7580, lng: -120.7320 }, { lat: 47.7450, lng: -120.7280 }] },
  { name: 'Golden Harvest', owner: 'Michael Brown', crop: 'Corn', soil: 'Sandy', location: 'Iowa, USA', robot: 'AgriBot-003', status: 'Active', cls: 'active', size: '200 acres', cropTypes: 'Corn, Soybeans', devices: '4', coordinates: [{ lat: 41.8781, lng: -93.0977 }, { lat: 41.8850, lng: -93.0900 }, { lat: 41.8720, lng: -93.0850 }] },
  { name: 'Maple Ridge Farm', owner: 'John Smith', crop: 'Soybeans', soil: 'Loam', location: 'Illinois, USA', robot: 'AgriBot-004', status: 'Active', cls: 'active', size: '150 acres', cropTypes: 'Soybeans, Wheat', devices: '2', coordinates: [{ lat: 40.6331, lng: -89.3985 }, { lat: 40.6400, lng: -89.3900 }, { lat: 40.6270, lng: -89.3850 }] },
  { name: 'River Bend Agriculture', owner: 'Emily Davis', crop: 'Rice', soil: 'Clay', location: 'Arkansas, USA', robot: 'AgriBot-005', status: 'Active', cls: 'active', size: '180 acres', cropTypes: 'Rice, Corn', devices: '3', coordinates: [{ lat: 34.7465, lng: -92.2896 }, { lat: 34.7530, lng: -92.2820 }, { lat: 34.7400, lng: -92.2770 }] },
  { name: 'Highland Crops', owner: 'David Wilson', crop: 'Corn', soil: 'Loam', location: 'Nebraska, USA', robot: 'AgriBot-006', status: 'Active', cls: 'active', size: '220 acres', cropTypes: 'Corn, Wheat', devices: '5', coordinates: [{ lat: 41.4925, lng: -99.9018 }, { lat: 41.4990, lng: -99.8940 }, { lat: 41.4860, lng: -99.8890 }] },
  { name: 'Coastal Farms', owner: 'Sarah Johnson', crop: 'Strawberries', soil: 'Sandy', location: 'Florida, USA', robot: 'AgriBot-007', status: 'Active', cls: 'active', size: '60 acres', cropTypes: 'Strawberries, Tomatoes', devices: '2', coordinates: [{ lat: 44.9429, lng: -123.0351 }, { lat: 44.9490, lng: -123.0270 }, { lat: 44.9370, lng: -123.0220 }] },
  { name: 'Valley View Ranch', owner: 'Michael Brown', crop: 'Alfalfa', soil: 'Loam', location: 'Texas, USA', robot: 'AgriBot-008', status: 'Active', cls: 'active', size: '300 acres', cropTypes: 'Alfalfa, Hay', devices: '4', coordinates: [{ lat: 31.9686, lng: -99.9018 }, { lat: 31.9750, lng: -99.8940 }, { lat: 31.9620, lng: -99.8890 }] },
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
