import os
from django.conf import settings
from django.db import models


def user_csv_upload_path(instance, filename):
    return f"datasets/user_{instance.user.id}/{filename}"


class UserDataset(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="datasets",
    )
    name = models.CharField(max_length=255, help_text="Original filename")
    csv_file = models.FileField(upload_to=user_csv_upload_path, blank=True, null=True)
    analytics_json = models.JSONField(
        help_text="Pre-computed analytics payload returned to the frontend"
    )
    source_currency = models.CharField(max_length=10, default="USD")
    row_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(
        default=True,
        help_text="The dataset the user currently sees on their dashboard",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.user.username} — {self.name} ({self.uploaded_at:%Y-%m-%d})"

    def save(self, *args, **kwargs):
        if self.is_active:
            UserDataset.objects.filter(user=self.user, is_active=True).exclude(
                pk=self.pk
            ).update(is_active=False)
        super().save(*args, **kwargs)
