import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Tag {
  id: number;
  name: string;
}

interface Activity {
  id: number;
  name: string;
  city_id: number;
  city_name?: string;
  cost: number;
  duration: number;
  category: string;
  tags: string[];
  pleasure_scores: { [key: string]: number };
}

interface City {
  id: number;
  name: string;
  region: string;
}

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {
  private apiUrl = 'http://localhost:8000';

  activities: Activity[]     = [];
  filteredActivities: Activity[] = [];
  cities: City[]             = [];
  tags: Tag[]                = [];

  // Filtres
  searchTerm     = '';
  selectedCity   = '';
  selectedCategory = '';
  selectedTag    = '';

  // UI state
  showModal      = false;
  showScoresModal = false;
  isEditing      = false;
  isLoading      = false;
  selectedActivity: Activity | null = null;

  // Tri
  sortColumn = 'id';
  sortAsc    = true;

  // Pagination
  currentPage  = 1;
  pageSize     = 10;

  categories = ['culture', 'nature', 'aventure', 'gastronomie'];
  tripTypes  = ['nature', 'culture', 'aventure', 'gastronomie', 'famille', 'plage', 'luxe'];

  form: FormGroup;
  scoresForm: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
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

  get headers() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadAll() {
    this.isLoading = true;
    this.http.get<City[]>(`${this.apiUrl}/admin/cities`, { headers: this.headers })
      .subscribe(cities => { this.cities = cities; });

    this.http.get<Tag[]>(`${this.apiUrl}/admin/tags`, { headers: this.headers })
      .subscribe(tags => { this.tags = tags; });

    this.http.get<Activity[]>(`${this.apiUrl}/admin/activities`, { headers: this.headers })
      .subscribe({
        next: acts => {
          this.activities = acts.map(a => ({
            ...a,
            city_name: this.cities.find(c => c.id === a.city_id)?.name || '—'
          }));
          this.applyFilters();
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
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

    // Tri
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
    this.scoresForm.patchValue(activity.pleasure_scores || {});
    this.showScoresModal = true;
  }

  isTagSelected(tagId: number): boolean {
    return (this.form.get('tag_ids')?.value || []).includes(tagId);
  }

  toggleTag(tagId: number) {
    const current: number[] = this.form.get('tag_ids')?.value || [];
    const updated = current.includes(tagId)
      ? current.filter(id => id !== tagId)
      : [...current, tagId];
    this.form.get('tag_ids')?.setValue(updated);
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.value;

    if (this.isEditing && this.selectedActivity) {
      this.http.patch(`${this.apiUrl}/admin/activities/${this.selectedActivity.id}`, payload, { headers: this.headers })
        .subscribe(() => { this.showModal = false; this.loadAll(); });
    } else {
      this.http.post(`${this.apiUrl}/admin/activities`, payload, { headers: this.headers })
        .subscribe(() => { this.showModal = false; this.loadAll(); });
    }
  }

  saveScores() {
    if (!this.selectedActivity) return;
    this.http.patch(
      `${this.apiUrl}/admin/activities/${this.selectedActivity.id}/scores`,
      { pleasure_scores: this.scoresForm.value },
      { headers: this.headers }
    ).subscribe(() => { this.showScoresModal = false; this.loadAll(); });
  }

  delete(activity: Activity) {
    if (!confirm(`Supprimer "${activity.name}" ?`)) return;
    this.http.delete(`${this.apiUrl}/admin/activities/${activity.id}`, { headers: this.headers })
      .subscribe(() => this.loadAll());
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCity = '';
    this.selectedCategory = '';
    this.selectedTag = '';
    this.applyFilters();
  }

  getCityName(id: number): string {
    return this.cities.find(c => c.id === id)?.name || '—';
  }

  formatCost(cost: number): string {
    return cost.toLocaleString('fr-MG') + ' Ar';
  }
}