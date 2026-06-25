import { createContext, useContext, useState } from 'react';

const initialFarms = [
  { name: 'Green Valley Farm', owner: 'John Smith', crop: 'Wheat', soil: 'Clay', location: 'California, USA', robot: 'AgriBot-001', status: 'Active', cls: 'active', size: '120 acres', cropTypes: 'Wheat, Barley', devices: '3' },
  { name: 'Sunrise Orchards', owner: 'Sarah Johnson', crop: 'Apples', soil: 'Loam', location: 'Washington, USA', robot: 'AgriBot-002', status: 'Active', cls: 'active', size: '85 acres', cropTypes: 'Apples, Pears', devices: '2' },
  { name: 'Golden Harvest', owner: 'Michael Brown', crop: 'Corn', soil: 'Sandy', location: 'Iowa, USA', robot: 'AgriBot-003', status: 'Active', cls: 'active', size: '200 acres', cropTypes: 'Corn, Soybeans', devices: '4' },
  { name: 'Maple Ridge Farm', owner: 'John Smith', crop: 'Soybeans', soil: 'Loam', location: 'Illinois, USA', robot: 'AgriBot-004', status: 'Active', cls: 'active', size: '150 acres', cropTypes: 'Soybeans, Wheat', devices: '2' },
  { name: 'River Bend Agriculture', owner: 'Emily Davis', crop: 'Rice', soil: 'Clay', location: 'Arkansas, USA', robot: 'AgriBot-005', status: 'Active', cls: 'active', size: '180 acres', cropTypes: 'Rice, Corn', devices: '3' },
  { name: 'Highland Crops', owner: 'David Wilson', crop: 'Corn', soil: 'Loam', location: 'Nebraska, USA', robot: 'AgriBot-006', status: 'Active', cls: 'active', size: '220 acres', cropTypes: 'Corn, Wheat', devices: '5' },
  { name: 'Coastal Farms', owner: 'Sarah Johnson', crop: 'Strawberries', soil: 'Sandy', location: 'Florida, USA', robot: 'AgriBot-007', status: 'Active', cls: 'active', size: '60 acres', cropTypes: 'Strawberries, Tomatoes', devices: '2' },
  { name: 'Valley View Ranch', owner: 'Michael Brown', crop: 'Alfalfa', soil: 'Loam', location: 'Texas, USA', robot: 'AgriBot-008', status: 'Active', cls: 'active', size: '300 acres', cropTypes: 'Alfalfa, Hay', devices: '4' },
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
