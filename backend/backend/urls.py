from django.contrib import admin
from django.urls import path
from api.views import *
from django.urls import re_path, include
from api.routing import websocket_urlpatterns

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/hello/", hello_world),
    path("api/create_room/", create_room),
    path("api/data/", getReactData),
    path("api/insert/", insert_data),
    path("api/join_room/", join_room),
]
