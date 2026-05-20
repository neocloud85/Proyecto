import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarUsuarios } from './buscar-usuarios';

describe('BuscarUsuarios', () => {
  let component: BuscarUsuarios;
  let fixture: ComponentFixture<BuscarUsuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarUsuarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarUsuarios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
