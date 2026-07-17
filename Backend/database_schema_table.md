# Smart Agriculture Database Schema

## 1. Farmer

| Field Name | Data Type | Description       |
| ---------- | --------- | ----------------- |
| id         | PK        | Unique Farmer ID  |
| full_name  | String    | Farmer Full Name  |
| name       | String    | Farmer Name       |
| email      | String    | Email Address     |
| mobile     | String    | Mobile Number     |
| created_at | DateTime  | Registration Time |

---

## 2. Farm

| Field Name   | Data Type | Description    |
| ------------ | --------- | -------------- |
| id           | PK        | Unique Farm ID |
| farmer_id    | FK        | Linked Farmer  |
| farm_name    | String    | Farm Name      |
| latitude     | Decimal   | GPS Latitude   |
| longitude    | Decimal   | GPS Longitude  |
| area_hectare | Float     | Farm Area      |
| address      | Text      | Farm Address   |
| created_at   | DateTime  | Creation Time  |

---

## 3. Soil

| Field Name     | Data Type | Description            |
| -------------- | --------- | ---------------------- |
| id             | PK        | Unique Soil Record     |
| farm_id        | FK        | Linked Farm            |
| soil_type      | String    | Clay / Sandy / Loamy   |
| texture        | String    | Fine / Medium / Coarse |
| color          | String    | Soil Color             |
| ph_value       | Float     | Soil pH                |
| nitrogen       | Float     | Nitrogen Value         |
| phosphorus     | Float     | Phosphorus Value       |
| potassium      | Float     | Potassium Value        |
| organic_matter | Float     | Organic Content        |
| salinity       | Float     | Salt Content           |
| last_test_date | Date      | Last Soil Test         |

---

## 4. Crop

| Field Name            | Data Type | Description          |
| --------------------- | --------- | -------------------- |
| id                    | PK        | Unique Crop ID       |
| farm_id               | FK        | Linked Farm          |
| crop_name             | String    | Crop Name            |
| crop_variety          | String    | Crop Variety         |
| sowing_date           | Date      | Sowing Date          |
| expected_harvest_date | Date      | Expected Harvest     |
| growth_stage          | String    | Current Growth Stage |
| plant_count           | Integer   | Number of Plants     |
| status                | String    | Active / Harvested   |

---

## 5. Robot

| Field Name | Data Type | Description |
| ---------- | --------- | ----------- |
| id | PK | Unique Robot ID |
| farm_id | FK | Linked Farm |
| robot_code | String | Robot Identifier |
| robot_model | String | Robot Model |
| firmware_version | String | Firmware Version |
| battery_level | Integer | Battery Percentage |
| status | String | Active / Idle / Offline / Maintenance |
| ip_address | String | Robot IP Address |
| mqtt_topic | String | MQTT Topic |
| last_active | DateTime | Last Communication |
| created_at | DateTime | Registration Time |

---

## 6. SensorData

| Field Name | Data Type | Description |
| ---------- | --------- | ----------- |
| id | PK | Unique Reading ID |
| robot_id | FK | Linked Robot |
| temperature | Float | Temperature |
| humidity | Float | Humidity |
| soil_moisture | Float | Soil Moisture |
| soil_temperature | Float | Soil Temperature |
| nitrogen | Float | Nitrogen Value |
| phosphorus | Float | Phosphorus Value |
| potassium | Float | Potassium Value |
| light_intensity | Float | Sunlight Intensity |
| wind_speed | Float | Wind Speed |
| rainfall | Float | Rainfall |
| sensor_status | String | Active / Inactive / Faulty |
| recorded_at | DateTime | Reading Timestamp |


---

## 7. Recommendation

| Field Name          | Data Type | Description             |
| ------------------- | --------- | ----------------------- |
| id                  | PK        | Recommendation ID       |
| farm_id             | FK        | Linked Farm             |
| recommendation_type | String    | Irrigation / Fertilizer |
| message             | Text      | AI Recommendation       |
| priority            | String    | Low / Medium / High     |
| created_at          | DateTime  | Generated Time          |
| generated_by | String | AI / Manual / Agronomist |
| created_at | DateTime | Generated Time |

---

## 8. Weather

| Field Name | Data Type | Description |
| ---------- | --------- | ----------- |
| id | PK | Weather Record ID |
| farm_id | FK | Linked Farm |
| temperature | Float | Temperature (°C) |
| humidity | Float | Humidity (%) |
| wind_speed | Float | Wind Speed (km/h) |
| rain_probability | Float | Chance of Rain (%) |
| pressure | Float | Atmospheric Pressure |
| weather_condition | String | Sunny / Cloudy / Rainy |
| uv_index | Float | UV Index |
| recorded_at | DateTime | Weather Timestamp |

---
## 9. Task

| Field Name | Data Type | Description |
| ---------- | --------- | ----------- |
| id | PK | Unique Task ID |
| farm_id | FK | Linked Farm |
| robot_id | FK | Assigned Robot |
| title | String | Task Title |
| description | Text | Task Description |
| priority | String | Low / Medium / High |
| status | String | Pending / In Progress / Completed |
| created_at | DateTime | Creation Time |

---

## 10. ActivityLog

| Field Name | Data Type | Description |
| ---------- | --------- | ----------- |
| id | PK | Unique Log ID |
| robot_id | FK | Linked Robot |
| activity | Text | Robot Activity |
| activity_type | String | Navigation / Irrigation / Monitoring |
| created_at | DateTime | Activity Time |

---

# Relationships

| Parent Table | Child Table       | Relation    |
| ------------ | ----------------- | ----------- |
| Farmer       | Farm              | One-to-Many |
| Farm         | Soil              | One-to-One  |
| Farm         | Crop              | One-to-Many |
| Farm         | Robot             | One-to-Many |
| Robot        | SensorData        | One-to-Many |
| Farm         | Recommendation    | One-to-Many |
| Crop         | DiseasePrediction | One-to-Many |

---

# Weather Module

## Weather API Response Schema

```json
{
  "location": "Pune",
  "temperature": 32.5,
  "humidity": 68,
  "wind_speed": 12.4,
  "rain_probability": 75,
  "weather_condition": "Cloudy",
  "pressure": 1012,
  "uv_index": 5,
  "timestamp": "2026-06-17T18:00:00Z"
}
```

---

## Weather Table

| Field Name        | Data Type | Description            |
| ----------------- | --------- | ---------------------- |
| id                | PK        | Weather Record ID      |
| farm_id           | FK        | Linked Farm            |
| temperature       | Float     | Temperature (°C)       |
| humidity          | Float     | Humidity (%)           |
| wind_speed        | Float     | Wind Speed (km/h)      |
| rain_probability  | Float     | Chance of Rain (%)     |
| pressure          | Float     | Atmospheric Pressure   |
| weather_condition | String    | Sunny / Cloudy / Rainy |
| uv_index          | Float     | UV Index               |
| recorded_at       | DateTime  | Weather Timestamp      |

---

## Weather APIs

| Method | Endpoint                    | Description               |
| ------ | --------------------------- | ------------------------- |
| GET    | /api/weather/current        | Get Current Weather       |
| GET    | /api/weather/forecast       | Get Weather Forecast      |
| GET    | /api/weather/farm/{farm_id} | Get Farm Specific Weather |
| POST   | /api/weather/sync           | Sync Latest Weather Data  |

---
    

## Sample Dashboard Output

```text
Temperature: 32°C
Humidity: 68%
Wind Speed: 12 km/h
Rain Probability: 75%
Weather Condition: Cloudy
```
