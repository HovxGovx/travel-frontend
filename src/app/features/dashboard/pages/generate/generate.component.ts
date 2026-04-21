import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TripService, TripResult, TripRequest } from '../../../../core/services/trip.service';
import { ActivityService, City } from '../../../../core/services/activity.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-generate',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.css']
})
export class GenerateComponent implements OnInit {

  // Steps
  currentStep = 1;
  totalSteps  = 3;

  // Données
  cities:  City[]       = [];
  trips:   TripResult[] = [];

  // UI state
  isGenerating   = false;
  progressValue  = 0;
  progressLabel  = '';
  generatedTrip: TripResult | null = null;
  showHistory    = false;
  errorMessage   = '';

  // Villes sélectionnées
  selectedCities: string[] = [];

  tripTypes = [
    { value: 'nature',      label: 'Nature',      emoji: '🌿' },
    { value: 'culture',     label: 'Culture',     emoji: '🏛️' },
    { value: 'aventure',    label: 'Aventure',    emoji: '🧗' },
    { value: 'gastronomie', label: 'Gastronomie', emoji: '🍽️' },
    { value: 'famille',     label: 'Famille',     emoji: '👨‍👩‍👧' },
    { value: 'plage',       label: 'Plage',       emoji: '🏖️' },
    { value: 'luxe',        label: 'Luxe',        emoji: '💎' },
  ];

  optimizeModes = [
    { value: 'balanced', label: 'Équilibré',      emoji: '⚖️',  desc: 'Plaisir + budget + diversité' },
    { value: 'pleasure', label: 'Max plaisir',    emoji: '😍',  desc: 'Les meilleures activités' },
    { value: 'budget',   label: 'Économique',     emoji: '💰',  desc: 'Minimiser les dépenses' },
    { value: 'cities',   label: 'Max villes',     emoji: '🗺️',  desc: 'Visiter le plus de villes' },
  ];

  // Formulaire step 1
  step1: FormGroup;
  // Formulaire step 2
  step2: FormGroup;

  constructor(
    private tripService: TripService,
    private activityService: ActivityService,
    private fb: FormBuilder
  ) {
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
    this.activityService.getCities().subscribe(c => this.cities = c);
    this.loadHistory();
  }

  loadHistory() {
    this.tripService.getMyTrips().subscribe({
      next: trips => this.trips = trips.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
      error: () => {}
    });
  }

  // ── Navigation steps ──────────────────────────────────────────────────

  nextStep() {
    if (this.currentStep === 1 && this.step1.invalid) return;
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  goToStep(step: number) {
    if (step < this.currentStep) this.currentStep = step;
  }

  // ── Sélection trip type ───────────────────────────────────────────────

  selectTripType(value: string) {
    this.step1.get('trip_type')?.setValue(value);
  }

  selectOptimize(value: string) {
    this.step2.get('optimize_for')?.setValue(value);
  }

  // ── Sélection villes ─────────────────────────────────────────────────

  toggleCity(cityName: string) {
    const idx = this.selectedCities.indexOf(cityName);
    if (idx > -1) this.selectedCities.splice(idx, 1);
    else this.selectedCities.push(cityName);
  }

  isCitySelected(cityName: string): boolean {
    return this.selectedCities.includes(cityName);
  }

  // ── Génération ────────────────────────────────────────────────────────

  generate() {
    if (this.step1.invalid || this.step2.invalid) return;

    this.isGenerating  = true;
    this.generatedTrip = null;
    this.errorMessage  = '';
    this.progressValue = 0;

    // Simulation progression animée
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

    let msgIndex = 0;
    this.progressLabel = messages[0];

    const interval = setInterval(() => {
      this.progressValue += Math.random() * 12 + 3;
      if (this.progressValue > 90) this.progressValue = 90;
      msgIndex = Math.min(Math.floor(this.progressValue / 12), messages.length - 1);
      this.progressLabel = messages[msgIndex];
    }, 400);

    const payload: TripRequest = {
      budget:       this.step1.value.budget,
      duration:     this.step1.value.duration,
      trip_type:    this.step1.value.trip_type,
      optimize_for: this.step2.value.optimize_for,
      cities:       this.selectedCities,
    };

    this.tripService.generate(payload).subscribe({
      next: (trip) => {
        clearInterval(interval);
        this.progressValue = 100;
        this.progressLabel = 'Itinéraire optimal trouvé ! ✅';
        setTimeout(() => {
          this.isGenerating  = false;
          this.generatedTrip = trip;
          this.loadHistory();
        }, 800);
      },
      error: (err) => {
        clearInterval(interval);
        this.isGenerating = false;
        this.errorMessage = err.error?.detail || 'Une erreur est survenue.';
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  reset() {
    this.currentStep   = 1;
    this.generatedTrip = null;
    this.errorMessage  = '';
    this.progressValue = 0;
    this.selectedCities = [];
    this.step1.reset({ budget: 500000, duration: 5, trip_type: '' });
    this.step2.reset({ optimize_for: 'balanced' });
  }

  deleteTrip(id: number, e: Event) {
    e.stopPropagation();
    if (!confirm('Supprimer ce voyage ?')) return;
    this.tripService.deleteTrip(id).subscribe(() => this.loadHistory());
  }

  formatCost(n: number): string {
    return n?.toLocaleString('fr-MG') + ' Ar';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  getScoreColor(score: number): string {
    if (score >= 0.8) return '#4ade80';
    if (score >= 0.6) return '#fbbf24';
    return '#f87171';
  }

  getTripTypeEmoji(type: string): string {
    return this.tripTypes.find(t => t.value === type)?.emoji ?? '🌍';
  }

  getOptimizeLabel(mode: string): string {
    return this.optimizeModes.find(m => m.value === mode)?.label ?? mode;
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