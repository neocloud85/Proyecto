import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherReviews } from './other-reviews';

describe('OtherReviews', () => {
  let component: OtherReviews;
  let fixture: ComponentFixture<OtherReviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherReviews]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherReviews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
