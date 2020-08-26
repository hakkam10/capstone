from django.contrib import admin
from .models import *

class DiscussionAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}
    
# Register your models here.
admin.site.register(User)
admin.site.register(Topic)
admin.site.register(Discussion)
admin.site.register(Follower)
admin.site.register(Argument)
admin.site.register(Like)

