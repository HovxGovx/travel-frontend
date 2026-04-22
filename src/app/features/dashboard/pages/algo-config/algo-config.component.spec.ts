import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgoConfigComponent } from './algo-config.component';

describe('AlgoConfigComponent', () => {
  let component: AlgoConfigComponent;
  let fixture: ComponentFixture<AlgoConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlgoConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlgoConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
