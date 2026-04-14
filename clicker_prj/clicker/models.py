from django.db import models

class ClickUser(models.Model):
    name = models.CharField(max_length=50)
    pin = models.CharField(max_length=4)
    count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('name','pin') 
        
    def __str__(self):
        return f"{self.name} - {self.count}"