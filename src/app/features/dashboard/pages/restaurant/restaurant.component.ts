import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestaurantService, Restaurant } from '../../../../core/services/restaurant.service';
import { CityService, City } from '../../../../core/services/city.service';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './restaurants.component.html',
  styleUrls: ['../activities/activities.component.css']
})
export class RestaurantsComponent implements OnInit {

  restaurants:         Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  cities:              City[]       = [];

  searchTerm    = '';
  selectedCity  = '';
  selectedCuisine = '';
  sortColumn    = 'id';
  sortAsc       = true;
  showModal     = false;
  isLoading     = false;
  currentPage   = 1;
  pageSize      = 10;

  cuisines = ['malgache', 'française', 'fusion', 'fruits de mer', 'internationale', 'gastronomie'];
  form: FormGroup;

  constructor(
          private RestaurantService: RestaurantService,
          private CityService: CityService, 
          private fb: FormBuilder) 
        {
    this.form = this.fb.group({
      name:      ['', Validators.required],
      city_id:   ['', Validators.required],
      cuisine:   ['', Validators.required],
      price_avg: [0,  [Validators.required, Validators.min(0)]],
      rating:    [4,  [Validators.required, Validators.min(0), Validators.max(5)]],
    });
  }

  ngOnInit() {
    this.CityService.getCities().subscribe(c => { this.cities = c; this.load(); });
  }

  load() {
    this.isLoading = true;
    this.RestaurantService.getRestaurants().subscribe({
      next: data => { this.restaurants = data; this.applyFilters(); this.isLoading = false; },
      error: ()  => { this.isLoading = false; }
    });
  }

  applyFilters() {
    let r = [...this.restaurants];
    if (this.searchTerm.trim()) {
      const s = this.searchTerm.toLowerCase();
      r = r.filter(x => x.name.toLowerCase().includes(s) || x.id.toString().includes(s));
    }
    if (this.selectedCity)    r = r.filter(x => x.city_id === +this.selectedCity);
    if (this.selectedCuisine) r = r.filter(x => x.cuisine === this.selectedCuisine);
    r.sort((a, b) => {
      const va = (a as any)[this.sortColumn];
      const vb = (b as any)[this.sortColumn];
      return this.sortAsc ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
    });
    this.filteredRestaurants = r;
    this.currentPage = 1;
  }

  sort(col: string) {
    this.sortColumn === col ? this.sortAsc = !this.sortAsc : (this.sortColumn = col, this.sortAsc = true);
    this.applyFilters();
  }

  get paginated() {
    const s = (this.currentPage - 1) * this.pageSize;
    return this.filteredRestaurants.slice(s, s + this.pageSize);
  }

  get totalPages() { return Math.ceil(this.filteredRestaurants.length / this.pageSize); }
  get pages()      { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  getCityName(id: number): string { return this.cities.find(c => c.id === id)?.name ?? '—'; }
  formatCost(n: number): string   { return n?.toLocaleString('fr-MG') + ' Ar'; }
  getRatingStars(n: number): string {
    const full  = Math.floor(n);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty) + ` (${n})`;
  }

  save() {
    if (this.form.invalid) return;
    this.RestaurantService.createRestaurant(this.form.value).subscribe(() => { this.showModal = false; this.load(); });
  }

  delete(r: Restaurant) {
    if (!confirm(`Supprimer "${r.name}" ?`)) return;
    this.RestaurantService.deleteRestaurant(r.id).subscribe(() => this.load());
  }

  openCreate() { this.form.reset({ price_avg: 0, rating: 4 }); this.showModal = true; }
  clearFilters() { this.searchTerm = ''; this.selectedCity = ''; this.selectedCuisine = ''; this.applyFilters(); }
}