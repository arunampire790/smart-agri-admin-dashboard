SMART AGRICULTURE DATABASE SCHEMA

=================================================
1. Farmer
=================================================

id (PK)
name
email
mobile
password
created_at

Description:
Stores farmer information.


=================================================
2. Farm
=================================================

id (PK)
farmer_id (FK)

farm_name
latitude
longitude
area_hectare
address

created_at

Description:
Stores farm details belonging to a farmer.


=================================================
3. Soil
=================================================

id (PK)
farm_id (FK)

soil_type
texture
color

ph_value

nitrogen
phosphorus
potassium

organic_matter

salinity

last_test_date

Description:
Stores soil characteristics and nutrient values.


=================================================
4. Crop
=================================================

id (PK)
farm_id (FK)

crop_name
crop_variety

sowing_date
expected_harvest_date

growth_stage

plant_count

status

Description:
Stores crop information for each farm.


=================================================
5. Robot
=================================================

id (PK)
farm_id (FK)

robot_code

battery_level

status

last_active

Description:
Stores robot details assigned to a farm.


=================================================
6. SensorData
=================================================

id (PK)
robot_id (FK)

temperature
humidity

soil_moisture

soil_temperature

nitrogen
phosphorus
potassium

light_intensity

wind_speed

rainfall

recorded_at

Description:
Stores real-time sensor readings from robots.


=================================================
7. Recommendation
=================================================

id (PK)
farm_id (FK)

recommendation_type

message

priority

created_at

Description:
Stores AI-generated recommendations.

Examples:
- Irrigation
- Fertilizer
- Disease Alert
- Harvest Alert


=================================================
8. DiseasePrediction
=================================================

id (PK)
crop_id (FK)

disease_name

confidence

image_url

prediction_time

Description:
Stores AI disease prediction results.



RELATIONSHIPS

Farmer (1) -------- (M) Farm

Farm (1) ---------- (1) Soil

Farm (1) ---------- (M) Crop

Farm (1) ---------- (M) Robot

Robot (1) --------- (M) SensorData

Farm (1) ---------- (M) Recommendation

Crop (1) ---------- (M) DiseasePrediction