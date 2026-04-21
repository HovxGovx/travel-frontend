import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CityService, City } from '../../../../core/services/city.service';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.css']
})
export class CitiesComponent implements OnInit {

  cities:          City[] = [];
  filteredCities:  City[] = [];
  searchTerm     = '';
  sortColumn     = 'id';
  sortAsc        = true;
  showModal      = false;
  isLoading      = false;
  currentPage    = 1;
  pageSize       = 10;

  form: FormGroup;

  constructor(private CityService: CityService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name:   ['', Validators.required],
      region: ['', Validators.required],
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.CityService.getCities().subscribe({
      next: data => { this.cities = data; this.applyFilters(); this.isLoading = false; },
      error: ()  => { this.isLoading = false; }
    });
  }

  applyFilters() {
    let r = [...this.cities];
    if (this.searchTerm.trim()) {
      const s = this.searchTerm.toLowerCase();
      r = r.filter(c => c.name.toLowerCase().includes(s) || c.region.toLowerCase().includes(s) || c.id.toString().includes(s));
    }
    r.sort((a, b) => {
      const va = (a as any)[this.sortColumn];
      const vb = (b as any)[this.sortColumn];
      return this.sortAsc ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
    });
    this.filteredCities = r;
    this.currentPage = 1;
  }

  sort(col: string) {
    this.sortColumn === col ? this.sortAsc = !this.sortAsc : (this.sortColumn = col, this.sortAsc = true);
    this.applyFilters();
  }

  get paginated() {
    const s = (this.currentPage - 1) * this.pageSize;
    return this.filteredCities.slice(s, s + this.pageSize);
  }

  get totalPages() { return Math.ceil(this.filteredCities.length / this.pageSize); }
  get pages()      { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  save() {
    if (this.form.invalid) return;
    this.CityService.createCity(this.form.value).subscribe(() => { this.showModal = false; this.load(); });
  }

  delete(city: City) {
    if (!confirm(`Supprimer "${city.name}" ?`)) return;
    this.CityService.deleteCity(city.id).subscribe(() => this.load());
  }

  openCreate() { this.form.reset(); this.showModal = true; }
  clearFilters() { this.searchTerm = ''; this.applyFilters(); }
}