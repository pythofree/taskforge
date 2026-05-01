from django.urls import path

from .views import ByDayView, ByTypeView, PerformanceView, SummaryView

urlpatterns = [
    path('summary/', SummaryView.as_view(), name='analytics-summary'),
    path('by-type/', ByTypeView.as_view(), name='analytics-by-type'),
    path('by-day/', ByDayView.as_view(), name='analytics-by-day'),
    path('performance/', PerformanceView.as_view(), name='analytics-performance'),
]
