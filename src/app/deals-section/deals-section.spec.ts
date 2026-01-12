import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealsSection } from './deals-section';

describe('DealsSection', () => {
  let component: DealsSection;
  let fixture: ComponentFixture<DealsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealsSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
