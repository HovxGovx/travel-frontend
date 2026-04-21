import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransportService, Transport } from '../../../../core/services/transport.service';
import { CityService, City } from '../../../../core/services/city.service';

@Component({
  selector: 'app-transports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './transports.component.html',
  styleUrls: ['./transports.component.scss']
})
export class TransportsComponent implements OnInit {

  transports:         Transport[] = [];
  filteredTransports: Transport[] = [];
  cities:             City[]      = [];

  searchTerm    = '';
  selectedType  = '';
  selectedOrigin = '';
  sortColumn    = 'id';
  sortAsc       = true;
  showModal     = false;
  isLoading     = false;
  currentPage   = 1;
  pageSize      = 10;

  types = ['bus', 'avion', 'train', 'taxi'];
  form: FormGroup;

  constructor(private TransportService: TransportService,private CityService: CityService , private fb: FormBuilder) {
    this.form = this.fb.group({
      name:                ['', Validators.required],
      type:                ['', Validators.required],
      origin_city_id:      ['', Validators.required],
      destination_city_id: ['', Validators.required],
      cost:                [0,  [Validators.required, Validators.min(0)]],
      duration:            [1,  [Validators.required, Validators.min(0.1)]],
    });
  }

  ngOnInit() {
    this.CityService.getCities().subscribe(c => { this.cities = c; this.load(); });
  }

  load() {
    this.isLoading = true;
    this.TransportService.getTransports().subscribe({
      next: data => { this.transports = data; this.applyFilters(); this.isLoading = false; },
      error: ()  => { this.isLoading = false; }
    });
  }

  applyFilters() {
    let r = [...this.transports];
    if (this.searchTerm.trim()) {
      const s = this.searchTerm.toLowerCase();
      r = r.filter(t => t.name.toLowerCase().includes(s) || t.id.toString().includes(s));
    }
    if (this.selectedType)   r = r.filter(t => t.type === this.selectedType);
    if (this.selectedOrigin) r = r.filter(t => t.origin_city_id === +this.selectedOrigin);

    r.sort((a, b) => {
      const va = (a as any)[this.sortColumn];
      const vb = (b as any)[this.sortColumn];
      return this.sortAsc ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
    });
    this.filteredTransports = r;
    this.currentPage = 1;
  }

  sort(col: string) {
    this.sortColumn === col ? this.sortAsc = !this.sortAsc : (this.sortColumn = col, this.sortAsc = true);
    this.applyFilters();
  }

  get paginated() {
    const s = (this.currentPage - 1) * this.pageSize;
    return this.filteredTransports.slice(s, s + this.pageSize);
  }

  get totalPages() { return Math.ceil(this.filteredTransports.length / this.pageSize); }
  get pages()      { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  getCityName(id: number): string {
    return this.cities.find(c => c.id === id)?.name ?? '—';
  }

  formatCost(n: number): string { return n?.toLocaleString('fr-MG') + ' Ar'; }

  save() {
    if (this.form.invalid) return;
    this.TransportService.createTransport(this.form.value).subscribe(() => { this.showModal = false; this.load(); });
  }

  delete(t: Transport) {
    if (!confirm(`Supprimer "${t.name}" ?`)) return;
    this.TransportService.deleteTransport(t.id).subscribe(() => this.load());
  }

  openCreate() { this.form.reset({ cost: 0, duration: 1 }); this.showModal = true; }
  clearFilters() { this.searchTerm = ''; this.selectedType = ''; this.selectedOrigin = ''; this.applyFilters(); }
}