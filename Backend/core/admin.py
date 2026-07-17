from django.contrib import admin

from .models import (
    Farmer,
    Farm,
    Soil,
    Crop,
    Robot,
    SensorData,
    Recommendation,
    Weather,
    Task,
    ActivityLog,
)

admin.site.register(Farmer)
admin.site.register(Farm)
admin.site.register(Soil)
admin.site.register(Crop)
admin.site.register(Robot)
admin.site.register(SensorData)
admin.site.register(Recommendation)
admin.site.register(Weather)
admin.site.register(Task)
admin.site.register(ActivityLog)