import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recomendaciones } from './recomendaciones';

describe('Recomendaciones', () => {
  let component: Recomendaciones;
  let fixture: ComponentFixture<Recomendaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recomendaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recomendaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
