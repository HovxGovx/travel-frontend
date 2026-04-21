import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotelService, Hotel } from '../../../../core/services/hotel.service';
import { CityService, City } from '../../../../core/services/city.service';


@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit {

  hotels:          Hotel[] = [];
  filteredHotels:  Hotel[] = [];
  cities:          City[]  = [];

  searchTerm       = '';
  selectedCity     = '';
  selectedCategory = '';
  sortColumn       = 'id';
  sortAsc          = true;
  showModal        = false;
  isLoading        = false;
  currentPage      = 1;
  pageSize         = 10;

  categories = ['budget', 'standard', 'luxury'];
  form: FormGroup;

  constructor(private HotelService: HotelService, private fb: FormBuilder, private CityService: CityService) {
    this.form = this.fb.group({
      name:            ['', Validators.required],
      city_id:         ['', Validators.required],
      stars:           [3,  [Validators.required, Validators.min(1), Validators.max(5)]],
      price_per_night: [0,  [Validators.required, Validators.min(0)]],
      category:        ['', Validators.required],
    });
  }

  ngOnInit() {
    this.CityService.getCities().subscribe(c => { this.cities = c; this.load(); });
  }

  load() {
    this.isLoading = true;
    this.HotelService.getHotels().subscribe({
      next: data => { this.hotels = data; this.applyFilters(); this.isLoading = false; },
      error: ()  => { this.isLoading = false; }
    });
  }

  applyFilters() {
    let r = [...this.hotels];
    if (this.searchTerm.trim()) {
      const s = this.searchTerm.toLowerCase();
      r = r.filter(h => h.name.toLowerCase().includes(s) || h.id.toString().includes(s));
    }
    if (this.selectedCity)     r = r.filter(h => h.city_id === +this.selectedCity);
    if (this.selectedCategory) r = r.filter(h => h.category === this.selectedCategory);
    r.sort((a, b) => {
      const va = (a as any)[this.sortColumn];
      const vb = (b as any)[this.sortColumn];
      return this.sortAsc ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
    });
    this.filteredHotels = r;
    this.currentPage = 1;
  }

  sort(col: string) {
    this.sortColumn === col ? this.sortAsc = !this.sortAsc : (this.sortColumn = col, this.sortAsc = true);
    this.applyFilters();
  }

  get paginated() {
    const s = (this.currentPage - 1) * this.pageSize;
    return this.filteredHotels.slice(s, s + this.pageSize);
  }

  get totalPages() { return Math.ceil(this.filteredHotels.length / this.pageSize); }
  get pages()      { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  getCityName(id: number): string { return this.cities.find(c => c.id === id)?.name ?? '—'; }
  formatCost(n: number): string   { return n?.toLocaleString('fr-MG') + ' Ar'; }
  getStars(n: number): string     { return '★'.repeat(n) + '☆'.repeat(5 - n); }

  save() {
    if (this.form.invalid) return;
    this.HotelService.createHotel(this.form.value).subscribe(() => { this.showModal = false; this.load(); });
  }

  delete(h: Hotel) {
    if (!confirm(`Supprimer "${h.name}" ?`)) return;
    this.HotelService.deleteHotel(h.id).subscribe(() => this.load());
  }

  openCreate() { this.form.reset({ stars: 3, price_per_night: 0 }); this.showModal = true; }
  clearFilters() { this.searchTerm = ''; this.selectedCity = ''; this.selectedCategory = ''; this.applyFilters(); }
}