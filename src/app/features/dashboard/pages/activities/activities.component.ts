import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivityService, Activity, City, Tag } from '../../../../core/services/activity.service';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {

  activities:         Activity[] = [];
  filteredActivities: Activity[] = [];
  cities:             City[]     = [];
  tags:               Tag[]      = [];

  // Filtres
  searchTerm       = '';
  selectedCity     = '';
  selectedCategory = '';
  selectedTag      = '';

  // UI state
  showModal       = false;
  showScoresModal = false;
  isEditing       = false;
  isLoading       = false;
  selectedActivity: Activity | null = null;

  // Tri
  sortColumn = 'id';
  sortAsc    = true;

  // Pagination
  currentPage = 1;
  pageSize    = 10;

  categories = ['culture', 'nature', 'aventure', 'gastronomie'];
  tripTypes  = ['nature', 'culture', 'aventure', 'gastronomie', 'famille', 'plage', 'luxe'];

  form:       FormGroup;
  scoresForm: FormGroup;

  constructor(
    private activityService: ActivityService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name:     ['', Validators.required],
      city_id:  ['', Validators.required],
      cost:     [0,  [Validators.required, Validators.min(0)]],
      duration: [1,  [Validators.required, Validators.min(0.5)]],
      category: ['', Validators.required],
      tag_ids:  [[]],
    });

    this.scoresForm = this.fb.group({
      nature:      [0, [Validators.min(0), Validators.max(10)]],
      culture:     [0, [Validators.min(0), Validators.max(10)]],
      aventure:    [0, [Validators.min(0), Validators.max(10)]],
      gastronomie: [0, [Validators.min(0), Validators.max(10)]],
      famille:     [0, [Validators.min(0), Validators.max(10)]],
      plage:       [0, [Validators.min(0), Validators.max(10)]],
      luxe:        [0, [Validators.min(0), Validators.max(10)]],
    });
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.isLoading = true;

    this.activityService.getCities().subscribe(cities => {
      this.cities = cities;

      this.activityService.getTags().subscribe(tags => {
        this.tags = tags;

        this.activityService.getActivities().subscribe({
          next: activities => {
            this.activities = activities;
            this.applyFilters();
            this.isLoading = false;
          },
          error: () => { this.isLoading = false; }
        });
      });
    });
  }

  applyFilters() {
    let result = [...this.activities];

    if (this.searchTerm.trim()) {
      const s = this.searchTerm.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(s) ||
        a.id.toString().includes(s)
      );
    }

    if (this.selectedCity)
      result = result.filter(a => a.city_id === +this.selectedCity);

    if (this.selectedCategory)
      result = result.filter(a => a.category === this.selectedCategory);

    if (this.selectedTag)
      result = result.filter(a => a.tags?.includes(this.selectedTag));

    result.sort((a, b) => {
      const valA = (a as any)[this.sortColumn];
      const valB = (b as any)[this.sortColumn];
      const cmp  = valA < valB ? -1 : valA > valB ? 1 : 0;
      return this.sortAsc ? cmp : -cmp;
    });

    this.filteredActivities = result;
    this.currentPage = 1;
  }

  sort(column: string) {
    if (this.sortColumn === column) this.sortAsc = !this.sortAsc;
    else { this.sortColumn = column; this.sortAsc = true; }
    this.applyFilters();
  }

  get paginatedActivities() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredActivities.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredActivities.length / this.pageSize);
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  openCreate() {
    this.isEditing = false;
    this.form.reset({ cost: 0, duration: 1, tag_ids: [] });
    this.showModal = true;
  }

  openEdit(activity: Activity) {
    this.isEditing        = true;
    this.selectedActivity = activity;
    const tagIds = this.tags
      .filter(t => activity.tags?.includes(t.name))
      .map(t => t.id);
    this.form.patchValue({ ...activity, tag_ids: tagIds });
    this.showModal = true;
  }

  openScores(activity: Activity) {
    this.selectedActivity = activity;
    this.scoresForm.patchValue(activity.pleasure_scores ?? {});
    this.showScoresModal = true;
  }

  isTagSelected(tagId: number): boolean {
    return (this.form.get('tag_ids')?.value ?? []).includes(tagId);
  }

  toggleTag(tagId: number) {
    const current: number[] = this.form.get('tag_ids')?.value ?? [];
    const updated = current.includes(tagId)
      ? current.filter(id => id !== tagId)
      : [...current, tagId];
    this.form.get('tag_ids')?.setValue(updated);
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.value;

    if (this.isEditing && this.selectedActivity) {
      this.activityService.updateActivity(this.selectedActivity.id, payload)
        .subscribe(() => { this.showModal = false; this.loadAll(); });
    } else {
      this.activityService.createActivity(payload)
        .subscribe(() => { this.showModal = false; this.loadAll(); });
    }
  }

  saveScores() {
    if (!this.selectedActivity) return;
    this.activityService.updateScores(this.selectedActivity.id, this.scoresForm.value)
      .subscribe(() => { this.showScoresModal = false; this.loadAll(); });
  }

  delete(activity: Activity) {
    if (!confirm(`Supprimer "${activity.name}" ?`)) return;
    this.activityService.deleteActivity(activity.id)
      .subscribe(() => this.loadAll());
  }

  clearFilters() {
    this.searchTerm      = '';
    this.selectedCity    = '';
    this.selectedCategory = '';
    this.selectedTag     = '';
    this.applyFilters();
  }

  getCityName(id: number): string {
    return this.cities.find(c => c.id === id)?.name ?? '—';
  }

  formatCost(cost: number): string {
    return cost.toLocaleString('fr-MG') + ' Ar';
  }
}