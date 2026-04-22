import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PublicService, City, Activity, Hotel, Transport, GeneratedTrip, TripDay } from '../../../../core/services/public.service';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.css']
})
export class PlannerComponent implements OnInit {

  // Données
  cities:     City[]      = [];
  activities: Activity[]  = [];
  hotels:     Hotel[]     = [];
  transports: Transport[] = [];

  // Steps
  currentStep  = 1;
  totalSteps   = 3;

  // Sélection villes
  selectedCities: string[] = [];

  // Generation
  isGenerating   = false;
  progressValue  = 0;
  progressLabel  = '';
  trip:          GeneratedTrip | null = null;
  errorMessage   = '';

  // Edition d'un jour
  showEditModal    = false;
  editingDayIndex  = -1;
  editingDay:      TripDay | null = null;

  // Filtres activités dans le modal
  activitySearch   = '';
  activityCityFilter = '';

  tripTypes = [
    { value: 'nature',      label: 'Nature'      },
    { value: 'culture',     label: 'Culture'     },
    { value: 'aventure',    label: 'Aventure'    },
    { value: 'gastronomie', label: 'Gastronomie' },
    { value: 'famille',     label: 'Famille'     },
    { value: 'plage',       label: 'Plage'       },
    { value: 'luxe',        label: 'Luxe'        },
  ];

  optimizeModes = [
    { value: 'balanced', label: 'Équilibré',   desc: 'Plaisir + budget + diversité' },
    { value: 'pleasure', label: 'Max plaisir', desc: 'Les meilleures activités'     },
    { value: 'budget',   label: 'Économique',  desc: 'Minimiser les dépenses'       },
    { value: 'cities',   label: 'Max villes',  desc: 'Visiter le plus de villes'    },
  ];

  step1: FormGroup;
  step2: FormGroup;

  constructor(private svc: PublicService, private fb: FormBuilder) {
    this.step1 = this.fb.group({
      budget:    [500000, [Validators.required, Validators.min(50000)]],
      duration:  [5,      [Validators.required, Validators.min(1), Validators.max(30)]],
      trip_type: ['',     Validators.required],
    });

    this.step2 = this.fb.group({
      optimize_for: ['balanced', Validators.required],
    });
  }

  ngOnInit() {
    this.svc.getCities().subscribe(c => this.cities = c);
    this.svc.getActivities().subscribe(a => this.activities = a);
    this.svc.getHotels().subscribe(h => this.hotels = h);
    this.svc.getTransports().subscribe(t => this.transports = t);
  }

  // ── Steps ──────────────────────────────────────────────────────────────
  nextStep() {
    if (this.currentStep === 1 && this.step1.invalid) return;
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  selectTripType(v: string)  { this.step1.get('trip_type')?.setValue(v); }
  selectOptimize(v: string)  { this.step2.get('optimize_for')?.setValue(v); }

  toggleCity(name: string) {
    const i = this.selectedCities.indexOf(name);
    i > -1 ? this.selectedCities.splice(i, 1) : this.selectedCities.push(name);
  }

  isCitySelected(name: string) { return this.selectedCities.includes(name); }

  // ── Génération ─────────────────────────────────────────────────────────
  generate() {
    if (this.step1.invalid) return;
    this.isGenerating = true;
    this.trip         = null;
    this.errorMessage = '';
    this.progressValue = 0;

    const messages = [
      'Initialisation de la population...',
      'Génération des chromosomes...',
      'Évaluation du fitness...',
      'Sélection des meilleurs itinéraires...',
      'Croisement et mutation...',
      'Convergence en cours...',
      'Optimisation finale...',
      'Préparation du résultat...',
    ];

    let mi = 0;
    this.progressLabel = messages[0];

    const iv = setInterval(() => {
      this.progressValue += Math.random() * 12 + 3;
      if (this.progressValue > 90) this.progressValue = 90;
      mi = Math.min(Math.floor(this.progressValue / 12), messages.length - 1);
      this.progressLabel = messages[mi];
    }, 400);

    this.svc.generate({
      budget:       this.step1.value.budget,
      duration:     this.step1.value.duration,
      trip_type:    this.step1.value.trip_type,
      optimize_for: this.step2.value.optimize_for,
      cities:       this.selectedCities,
    }).subscribe({
      next: result => {
        clearInterval(iv);
        this.progressValue = 100;
        this.progressLabel = 'Itinéraire optimal trouvé !';
        setTimeout(() => { this.isGenerating = false; this.trip = result.result; }, 800);
        console.log(result);
      },
      error: err => {
        clearInterval(iv);
        this.isGenerating = false;
        this.errorMessage = err.error?.detail || 'Une erreur est survenue.';
      }
    });
  }

  reset() {
    this.currentStep    = 1;
    this.trip           = null;
    this.errorMessage   = '';
    this.progressValue  = 0;
    this.selectedCities = [];
    this.step1.reset({ budget: 500000, duration: 5, trip_type: '' });
    this.step2.reset({ optimize_for: 'balanced' });
  }

  // ── Edition d'un jour ──────────────────────────────────────────────────
  openEditDay(index: number) {
    this.editingDayIndex     = index;
    this.editingDay          = JSON.parse(JSON.stringify(this.trip!.days[index]));
    this.activitySearch      = '';
    this.activityCityFilter  = this.editingDay?.city ?? '';
    this.showEditModal       = true;
  }

  closeEditModal() {
    this.showEditModal  = false;
    this.editingDay     = null;
    this.editingDayIndex = -1;
  }

  saveEditDay() {
    if (!this.trip || !this.editingDay) return;
    this.trip.days[this.editingDayIndex] = { ...this.editingDay };
    this.recalculateTotalCost();
    this.closeEditModal();
  }

  // ── Activités dans le modal ────────────────────────────────────────────
  get availableActivities(): Activity[] {
    return this.activities.filter(a => {
      const cityMatch = !this.activityCityFilter ||
        this.getCityName(a.city_id) === this.activityCityFilter;
      const searchMatch = !this.activitySearch ||
        a.name.toLowerCase().includes(this.activitySearch.toLowerCase());
      return cityMatch && searchMatch;
    });
  }

  isActivityInDay(actName: string): boolean {
    return this.editingDay?.activities.includes(actName) ?? false;
  }

  toggleActivityInDay(act: Activity) {
    if (!this.editingDay) return;
    const name = act.name;
    const idx  = this.editingDay.activities.indexOf(name);
    if (idx > -1) {
      this.editingDay.activities.splice(idx, 1);
      this.editingDay.cost_day -= act.cost;
    } else {
      this.editingDay.activities.push(name);
      this.editingDay.cost_day += act.cost;
    }
  }

  // ── Hôtel dans le modal ────────────────────────────────────────────────
  get hotelsForCity(): Hotel[] {
    const city = this.cities.find(c => c.name === this.editingDay?.city);
    return city ? this.hotels.filter(h => h.city_id === city.id) : [];
  }

  setHotel(hotel: Hotel) {
    if (!this.editingDay) return;
    const prev = this.hotels.find(h => h.name === this.editingDay!.hotel);
    if (prev) this.editingDay.cost_day -= prev.price_per_night;
    this.editingDay.hotel     = hotel.name;
    this.editingDay.cost_day += hotel.price_per_night;
  }

  // ── Transport dans le modal ────────────────────────────────────────────
  get transportsForDay(): Transport[] {
    if (!this.trip || this.editingDayIndex <= 0) return [];
    const prevCity = this.trip.days[this.editingDayIndex - 1].city;
    const currCity = this.editingDay?.city ?? '';
    if (prevCity === currCity) return [];
    const prev = this.cities.find(c => c.name === prevCity);
    const curr = this.cities.find(c => c.name === currCity);
    if (!prev || !curr) return [];
    return this.transports.filter(t =>
      t.origin_city_id === prev.id && t.destination_city_id === curr.id
    );
  }

  setTransport(t: Transport | null) {
    if (!this.editingDay) return;
    const prev = this.transports.find(tr => tr.name === this.editingDay!.transport);
    if (prev) this.editingDay.cost_day -= prev.cost;
    this.editingDay.transport  = t ? t.name : null;
    if (t) this.editingDay.cost_day += t.cost;
  }

  // ── Changer la ville d'un jour ─────────────────────────────────────────
  changeCity(cityName: string) {
    if (!this.editingDay) return;
    this.editingDay.city        = cityName;
    this.editingDay.activities  = [];
    this.editingDay.hotel       = null;
    this.editingDay.transport   = null;
    this.editingDay.cost_day    = 0;
    this.activityCityFilter     = cityName;
  }

  // ── Recalcul coût total ────────────────────────────────────────────────
  recalculateTotalCost() {
    if (!this.trip) return;
    this.trip.total_cost = this.trip.days.reduce((sum, d) => sum + d.cost_day, 0);
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  getCityName(id: number): string {
    return this.cities.find(c => c.id === id)?.name ?? '—';
  }

  formatCost(n: number): string {
    return (n ?? 0).toLocaleString('fr-MG') + ' Ar';
  }

  getScorePercent(score: number): number {
    return Math.round((score ?? 0) * 100);
  }

  getBudgetPercent(): number {
    if (!this.trip) return 0;
    return Math.round((this.trip.total_cost / this.trip.budget) * 100);
  }

  get summaryData() {
    return {
      budget:       this.step1.value.budget,
      duration:     this.step1.value.duration,
      trip_type:    this.tripTypes.find(t => t.value === this.step1.value.trip_type),
      optimize_for: this.optimizeModes.find(m => m.value === this.step2.value.optimize_for),
      cities:       this.selectedCities,
    };
  }
}