import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface AlgoConfig {
  id:                       number;
  population_size:          number;
  generations_pleasure:     number;
  generations_budget:       number;
  generations_cities:       number;
  generations_balanced:     number;
  crossover_rate:           number;
  mutation_rate_base:       number;
  mutation_rate_high:       number;
  stagnation_limit:         number;
  tournament_size:          number;
  max_consecutive_pleasure: number;
  max_consecutive_budget:   number;
  max_consecutive_cities:   number;
  max_consecutive_balanced: number;
}

@Component({
  selector: 'app-algo-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './algo-config.component.html',
  styleUrls: ['./algo-config.component.css']
})
export class AlgoConfigComponent implements OnInit {

  private base = 'http://localhost:8000/admin';

  config:    AlgoConfig | null = null;
  isLoading  = false;
  isSaving   = false;
  isResetting = false;
  saveSuccess = false;
  errorMsg   = '';

  form: FormGroup;

  sections = [
    {
      title: 'Population & Générations',
      desc:  'Contrôle la taille de la population et le nombre d\'itérations par mode.',
      fields: [
        { key: 'population_size',       label: 'Taille de la population',         desc: 'Nombre de chromosomes (itinéraires) par génération.',  min: 10,  max: 500,  step: 10,  type: 'int' },
        { key: 'generations_pleasure',  label: 'Générations — mode Plaisir',      desc: 'Itérations pour le mode maximisation du plaisir.',     min: 50,  max: 1000, step: 50,  type: 'int' },
        { key: 'generations_budget',    label: 'Générations — mode Budget',       desc: 'Itérations pour le mode économique.',                  min: 50,  max: 1000, step: 50,  type: 'int' },
        { key: 'generations_cities',    label: 'Générations — mode Villes',       desc: 'Itérations pour le mode maximisation des villes.',     min: 50,  max: 1000, step: 50,  type: 'int' },
        { key: 'generations_balanced',  label: 'Générations — mode Équilibré',    desc: 'Itérations pour le mode équilibré.',                   min: 50,  max: 1000, step: 50,  type: 'int' },
      ]
    },
    {
      title: 'Opérateurs génétiques',
      desc:  'Paramètres des opérateurs de croisement et mutation.',
      fields: [
        { key: 'crossover_rate',      label: 'Taux de croisement',           desc: 'Probabilité qu\'un enfant hérite de deux parents.',   min: 0.1,  max: 1.0, step: 0.05, type: 'float' },
        { key: 'mutation_rate_base',  label: 'Taux de mutation (normal)',    desc: 'Probabilité de mutation en fonctionnement normal.',   min: 0.01, max: 0.5, step: 0.01, type: 'float' },
        { key: 'mutation_rate_high',  label: 'Taux de mutation (stagnation)',desc: 'Taux appliqué quand l\'algorithme stagne.',           min: 0.1,  max: 1.0, step: 0.05, type: 'float' },
        { key: 'stagnation_limit',    label: 'Seuil de stagnation',          desc: 'Générations sans amélioration avant d\'augmenter la mutation.', min: 5, max: 100, step: 5, type: 'int' },
        { key: 'tournament_size',     label: 'Taille du tournoi',            desc: 'Nombre de candidats comparés lors de la sélection.',  min: 2,    max: 20,  step: 1,    type: 'int' },
      ]
    },
    {
      title: 'Contraintes de diversité',
      desc:  'Nombre maximum de jours consécutifs dans la même ville par mode.',
      fields: [
        { key: 'max_consecutive_pleasure', label: 'Max jours consécutifs — Plaisir',   desc: 'Au-delà, le chromosome est éliminé (-998).', min: 1, max: 10, step: 1, type: 'int' },
        { key: 'max_consecutive_budget',   label: 'Max jours consécutifs — Budget',    desc: 'Au-delà, le chromosome est éliminé (-998).', min: 1, max: 10, step: 1, type: 'int' },
        { key: 'max_consecutive_cities',   label: 'Max jours consécutifs — Villes',    desc: 'Au-delà, le chromosome est éliminé (-998).', min: 1, max: 10, step: 1, type: 'int' },
        { key: 'max_consecutive_balanced', label: 'Max jours consécutifs — Équilibré', desc: 'Au-delà, le chromosome est éliminé (-998).', min: 1, max: 10, step: 1, type: 'int' },
      ]
    }
  ];

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      population_size:          [50,   [Validators.required, Validators.min(10),  Validators.max(500)]],
      generations_pleasure:     [200,  [Validators.required, Validators.min(50),  Validators.max(1000)]],
      generations_budget:       [200,  [Validators.required, Validators.min(50),  Validators.max(1000)]],
      generations_cities:       [300,  [Validators.required, Validators.min(50),  Validators.max(1000)]],
      generations_balanced:     [200,  [Validators.required, Validators.min(50),  Validators.max(1000)]],
      crossover_rate:           [0.8,  [Validators.required, Validators.min(0.1), Validators.max(1.0)]],
      mutation_rate_base:       [0.10, [Validators.required, Validators.min(0.01),Validators.max(0.5)]],
      mutation_rate_high:       [0.25, [Validators.required, Validators.min(0.1), Validators.max(1.0)]],
      stagnation_limit:         [20,   [Validators.required, Validators.min(5),   Validators.max(100)]],
      tournament_size:          [5,    [Validators.required, Validators.min(2),   Validators.max(20)]],
      max_consecutive_pleasure: [3,    [Validators.required, Validators.min(1),   Validators.max(10)]],
      max_consecutive_budget:   [2,    [Validators.required, Validators.min(1),   Validators.max(10)]],
      max_consecutive_cities:   [2,    [Validators.required, Validators.min(1),   Validators.max(10)]],
      max_consecutive_balanced: [2,    [Validators.required, Validators.min(1),   Validators.max(10)]],
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.http.get<AlgoConfig>(`${this.base}/algo-config`).subscribe({
      next: config => {
        this.config = config;
        this.form.patchValue(config);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.isSaving    = true;
    this.saveSuccess = false;
    this.errorMsg    = '';

    this.http.patch<AlgoConfig>(`${this.base}/algo-config`, this.form.value).subscribe({
      next: config => {
        this.config      = config;
        this.isSaving    = false;
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMsg = err.error?.detail || 'Erreur lors de la sauvegarde.';
      }
    });
  }

  reset() {
    if (!confirm('Réinitialiser tous les paramètres aux valeurs par défaut ?')) return;
    this.isResetting = true;
    this.http.post<AlgoConfig>(`${this.base}/algo-config/reset`, {}).subscribe({
      next: config => {
        this.config = config;
        this.form.patchValue(config);
        this.isResetting = false;
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: () => { this.isResetting = false; }
    });
  }

  getFieldValue(key: string): number {
    return this.form.get(key)?.value ?? 0;
  }

  isFloat(type: string): boolean { return type === 'float'; }
}