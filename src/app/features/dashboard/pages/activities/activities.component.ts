import { Component, OnInit } from '@angular/core';
import { ActivityService, Activity } from '../../../../core/services/activity.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-activities',
  imports: [CommonModule],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.css'
})
export class ActivitiesComponent implements OnInit {
  activities: Activity[] = [];
  loading = true;
  error = '';

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.loadActivities();
  }
  loadActivities() {
    this.activityService.getActivities().subscribe({
      next: (data) => {
        this.activities = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des activités';
        console.error(err);
        this.loading = false;
      }
    });
  }
  deleteActivity(id: number): void {
    const confirmed = confirm(
      'Voulez-vous vraiment supprimer cette activité ?'
    );

    if (!confirmed) return;

    this.activityService.deleteActivity(id).subscribe({
      next: () => {
        this.activities = this.activities.filter(
          activity => activity.id !== id
        );
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la suppression');
      }
    });
  }
}
